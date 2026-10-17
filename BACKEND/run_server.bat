@echo off
title Fish POS Backend Server
cd /d "%~dp0"
echo Starting Fish POS Backend Server...
echo API Docs: http://localhost:8000/docs
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
