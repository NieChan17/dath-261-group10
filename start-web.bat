@echo off
cd /d "%~dp0"
title EduPulse Web & Tunnel Launcher
echo ========================================================
echo        STARTING EDUPULSE STAGING ENVIRONMENT
echo ========================================================
echo.

echo [1/3] Starting Docker containers...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Docker-compose failed to start.
    echo Please make sure Docker Desktop is running!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Containers are running healthy!
docker-compose ps

echo.
echo ========================================================
echo [3/3] Starting Cloudflare Tunnel...
echo NOTE: Keep this window OPEN while using the website!
echo ========================================================
echo.

.\cloudflared.exe tunnel --url http://127.0.0.1:80
pause
