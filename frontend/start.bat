@echo off
title Frontend Server (React)
echo starting frontend server

rem Change directory to the location of this script
cd /d %~dp0

rem Start the React server
npm start

pause