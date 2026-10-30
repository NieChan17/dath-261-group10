@echo off
title EduPulse Web & Tunnel Launcher
echo ========================================================
echo        STARTING EDUPULSE STAGING ENVIRONMENT
echo ========================================================
echo.

echo [1/3] Checking Docker containers...
docker-compose up -d

echo.
echo [2/3] Containers are running!
docker-compose ps

echo.
echo [3/3] Starting Public Tunnel (https://edupulse-group10.loca.lt)...
echo NOTE: Keep this command prompt window open while using the web!
echo Press Ctrl+C anytime if you want to stop the tunnel.
echo.

start https://edupulse-group10.loca.lt
npx localtunnel --port 80 --subdomain edupulse-group10
