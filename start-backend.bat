@echo off
title SmartPark Backend
echo Checking for processes on port 8081...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081 ^| findstr LISTENING') do (
    echo Killing stale backend process %%a...
    taskkill /f /pid %%a >nul 2>&1
)
echo Starting SmartPark Backend on port 8081...
set PATH=C:\maven\apache-maven-3.9.6\bin;%PATH%
cd /d "%~dp0backend"
mvn spring-boot:run
pause
