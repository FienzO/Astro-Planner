@echo off
title Backend (Flask)

rem Change directory to the location of this script
cd /d %~dp0

echo Activating the backend VE...
echo "python app.py" to start frontend
echo -------------------------------------------------------------

rem The '/k' flag runs the command and then keeps the cmd prompt open.
cmd /k "venv\Scripts\activate.bat"

