from fastapi import FastAPI, UploadFile, File, Depends, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json
import database
import models
from database import get_db
from ast_parser import parse_and_flatten
from comparison import levenshtein_similarity, rabin_karp_blocks

app = FastAPI(title="ASTra API", description="AST Plagiarism Checker API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to ASTra API"}

@app.post("/api/upload")
async def upload_files(
    batch_name: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    # Create a new batch
    batch = models.AssignmentBatch(name=batch_name)
    db.add(batch)
    db.commit()
    db.refresh(batch)
    
    submissions = []
    for file in files:
        content = await file.read()
        # Decode as UTF-8
        try:
            content_str = content.decode("utf-8")
        except UnicodeDecodeError:
            continue # skip non-text files
            
        student_id = file.filename.split('.')[0] # rudimentary ID
        
        submission = models.Submission(
            batch_id=batch.id,
            student_id=student_id,
            filename=file.filename,
            content=content_str
        )
        db.add(submission)
        submissions.append(submission)
        
    db.commit()
    return {"message": "Upload successful", "batch_id": batch.id, "files_processed": len(submissions)}

@app.get("/api/assignments")
def get_assignments(db: Session = Depends(get_db)):
    batches = db.query(models.AssignmentBatch).all()
    result = []
    for b in batches:
        result.append({
            "id": b.id,
            "name": b.name,
            "created_at": b.created_at,
            "submissions_count": len(b.submissions)
        })
    return result

@app.post("/api/compare/{batch_id}")
def run_comparison(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(models.AssignmentBatch).filter(models.AssignmentBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    submissions = batch.submissions
    if len(submissions) < 2:
        return {"message": "Not enough submissions to compare."}
        
    # Clear old scores for this batch to re-run
    # Find all scores where submission_1 is in this batch
    sub_ids = [s.id for s in submissions]
    db.query(models.SimilarityScore).filter(models.SimilarityScore.submission_1_id.in_(sub_ids)).delete(synchronize_session=False)
    
    # Parse all
    parsed_asts = {}
    for sub in submissions:
        parsed_asts[sub.id] = parse_and_flatten(sub.content)
        
    block_size = 5
    scores_created = 0
    
    for i in range(len(submissions)):
        for j in range(i + 1, len(submissions)):
            sub1 = submissions[i]
            sub2 = submissions[j]
            
            seq1 = parsed_asts[sub1.id]
            seq2 = parsed_asts[sub2.id]
            
            # 1. Levenshtein for total structural similarity
            types1 = [n['type'] for n in seq1]
            types2 = [n['type'] for n in seq2]
            score = levenshtein_similarity(types1, types2)
            
            # 2. Rabin-Karp for exact duplicate blocks
            matches = rabin_karp_blocks(seq1, seq2, block_size=block_size)
            
            details_list = []
            for m1, m2 in matches:
                # m1 and m2 are start indices
                lines1 = [n['lineno'] for n in seq1[m1 : m1+block_size] if n['lineno'] != -1]
                lines2 = [n['lineno'] for n in seq2[m2 : m2+block_size] if n['lineno'] != -1]
                
                if lines1 and lines2:
                    details_list.append({
                        "file1_lines": [min(lines1), max(lines1)],
                        "file2_lines": [min(lines2), max(lines2)]
                    })
                    
            sim_record = models.SimilarityScore(
                submission_1_id=sub1.id,
                submission_2_id=sub2.id,
                score=score,
                details=json.dumps(details_list)
            )
            db.add(sim_record)
            scores_created += 1
            
    db.commit()
    return {"message": f"Comparison complete. Calculated {scores_created} pairs."}

@app.get("/api/results/{batch_id}")
def get_results(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(models.AssignmentBatch).filter(models.AssignmentBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    sub_ids = [s.id for s in batch.submissions]
    scores = db.query(models.SimilarityScore).filter(models.SimilarityScore.submission_1_id.in_(sub_ids)).all()
    
    # Also fetch submissions to return names and codes
    subs_dict = {s.id: s for s in batch.submissions}
    
    result = []
    for sc in scores:
        s1 = subs_dict[sc.submission_1_id]
        s2 = subs_dict[sc.submission_2_id]
        result.append({
            "id": sc.id,
            "submission_1": {"id": s1.id, "student_id": s1.student_id, "filename": s1.filename, "content": s1.content},
            "submission_2": {"id": s2.id, "student_id": s2.student_id, "filename": s2.filename, "content": s2.content},
            "score": sc.score,
            "details": json.loads(sc.details) if sc.details else []
        })
        
    # sort by descending score
    result.sort(key=lambda x: x["score"], reverse=True)
    return result
