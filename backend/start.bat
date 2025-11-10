@echo off
title Backend (Flask)

cd /d %~dp0

echo Activating the backend VE...

cmd /k "call venv\Scripts\activate.bat && python app.py"

