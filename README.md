# ASTra: Structural Code Plagiarism Detector

## Overview
ASTra (Abstract Syntax Tree Analyzer) is a full-stack educational technology tool designed to detect structural code plagiarism. Unlike traditional diff checkers that rely on string matching and can be easily tricked by changing variable names or adding whitespace, ASTra fundamentally understands code logic.

It converts Python source code into an Abstract Syntax Tree (AST), flattens the nodal structure, and uses Dynamic Programming to calculate the exact structural similarity between two files.

## Core Features
- **Semantic Analysis**: Ignores comments, variable names, and formatting to analyze the pure logical flow of the code.
- **AST Flattening & Traversal**: Uses Python's native `ast` module to break down scripts into sequences of operational nodes.
- **Advanced DSA Diffing Engine**: Implements the Levenshtein Distance algorithm using a 2D Dynamic Programming matrix to calculate an exact similarity percentage (O(N * M) time complexity).
- **Rabin-Karp Block Matching**: Identifies and flags specific continuous blocks of copied logic across files using rolling hashes.
- **Interactive Code Viewer**: Integrates `@monaco-editor/react` for a VS Code-like split-pane diff viewer that visually highlights structurally identical lines.

## Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS, Monaco Editor
- **Backend**: Python, FastAPI, Uvicorn
- **Database**: PostgreSQL, SQLAlchemy (for storing assignment batches and submission metadata)

## System Architecture
1. The user uploads two or more `.py` scripts via the Next.js frontend.
2. The files are sent to the FastAPI backend where the AST Engine parses them.
3. The recursive traversal function strips out metadata and generates a flat array of node types (e.g., `For`, `Assign`, `BinOp`).
4. The DP engine calculates the edit distance between the arrays and maps the duplicated nodes back to their original line numbers.
5. The API returns a JSON payload containing the similarity score and line coordinates.
6. The frontend Monaco Editor dynamically applies background decorations to highlight the plagiarized sections.

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL

### Backend Setup
1. Clone the repository and navigate to the `backend` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment: 
   - Linux/Mac: `source venv/bin/activate` 
   - Windows: `venv\Scripts\activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Start the FastAPI server: `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open `http://localhost:3000` in your browser.

## Future Roadmap
- Implement `tree-sitter` to expand support for C++, Java, and JavaScript.
- Add batch processing to compare a single file against an entire database of past submissions.
- Integrate Role-Based Access Control (RBAC) for Professor and Student views.

## Author
Aryan Tiwari [Link to your LinkedIn/Portfolio]
