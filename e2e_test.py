import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def run_e2e_test():
    print("1. Uploading test scripts...")
    files = [
        ('files', ('student_a_baseline.py', open('test_scripts/student_a_baseline.py', 'rb'), 'text/x-python')),
        ('files', ('student_b_plagiarized.py', open('test_scripts/student_b_plagiarized.py', 'rb'), 'text/x-python')),
        ('files', ('student_c_different.py', open('test_scripts/student_c_different.py', 'rb'), 'text/x-python'))
    ]
    data = {'batch_name': 'E2E Automated Batch'}
    
    response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
    print(response.json())
    batch_id = response.json()['batch_id']
    
    print("\n2. Triggering comparison algorithm...")
    compare_response = requests.post(f"{BASE_URL}/compare/{batch_id}")
    print(compare_response.json())
    
    print("\n3. Fetching results...")
    results_response = requests.get(f"{BASE_URL}/results/{batch_id}")
    results = results_response.json()
    
    for r in results:
        f1 = r['submission_1']['filename']
        f2 = r['submission_2']['filename']
        score = r['score'] * 100
        blocks = len(r['details'])
        print(f"Similarity between {f1} and {f2}: {score:.1f}% ({blocks} identical AST blocks)")

if __name__ == "__main__":
    run_e2e_test()
