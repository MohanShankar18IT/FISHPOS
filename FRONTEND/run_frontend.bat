@echo off
title Fish POS Frontend Dev Server
cd /d "%~dp0"
set "PATH=%~dp0..\node_bin;%PATH%"
echo Starting Fish POS Frontend (Vite)...
echo App URL: http://localhost:5173
call npm run dev
pause
