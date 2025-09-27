@echo off
cls
echo ================================================================
echo    Stopping PalmExitGarage - Auto Repair Shop System
echo ================================================================
echo.

:: Navigate to the correct directory
cd /d "%~dp0"

echo Stopping PalmExitGarage services...

:: Kill Node.js processes (frontend and backend)
echo Stopping frontend and backend servers...
taskkill /f /im node.exe >nul 2>&1

:: Stop Docker containers
echo Stopping database container...
docker-compose -f ../docker-compose.yml down >nul 2>&1

echo.
echo ================================================================
echo    PalmExitGarage has been stopped successfully!
echo ================================================================
echo.
echo All services have been terminated.
echo To start PalmExitGarage again, run START_PALMEXITGARAGE.bat
echo.
pause