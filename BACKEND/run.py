import sys
import os
import uvicorn

# Ensure BACKEND folder is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("=========================================================")
    print("  MEANOMEEN FISH POS — FASTAPI BACKEND SERVER")
    print("  Swagger API Docs: http://localhost:8000/docs")
    print("  Health Status:    http://localhost:8000/health")
    print("=========================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
