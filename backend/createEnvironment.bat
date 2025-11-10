@echo off
title Backend Setup

cd /d %~dp0

echo Constructing Virtual Environment
cmd "python -m venv venv"
echo Starting VE and installing Dependencies
cmd ".\venv\Scripts\activate"
cmd "pip install -r requirements.txt"

