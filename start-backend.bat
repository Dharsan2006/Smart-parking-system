@echo off
title SmartPark Backend
echo Checking for processes on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Killing stale backend process %%a...
    taskkill /f /pid %%a >nul 2>&1
)
echo Starting SmartPark Backend...
set PATH=C:\maven\apache-maven-3.9.6\bin;%PATH%
cd /d "%~dp0backend"
mvn spring-boot:run
pause
