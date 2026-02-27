from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class AssignmentBatch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    submissions = relationship("Submission", back_populates="batch")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"))
    student_id = Column(String, index=True)
    filename = Column(String)
    content = Column(Text)
    
    batch = relationship("AssignmentBatch", back_populates="submissions")

class SimilarityScore(Base):
    __tablename__ = "similarity_scores"

    id = Column(Integer, primary_key=True, index=True)
    submission_1_id = Column(Integer, ForeignKey("submissions.id"))
    submission_2_id = Column(Integer, ForeignKey("submissions.id"))
    score = Column(Float)
    details = Column(Text) # JSON string of match coordinates
