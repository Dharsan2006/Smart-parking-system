@echo off
title SmartPark Backend
echo Starting SmartPark Backend...
set PATH=C:\maven\apache-maven-3.9.6\bin;%PATH%
cd /d "%~dp0backend"
mvn spring-boot:run
pause
