@echo off
cls
echo ================================================================
echo    Starting PalmExitGarage - MySQL Version
echo ================================================================
echo.

:: Navigate to project root
cd /d "%~dp0.."

:: Skipping MySQL service check to support any installed version.
echo Skipping MySQL service check. Ensure your MySQL service is running (e.g., MySQL80/84/91) before starting.
echo.

:: Start backend server
echo Starting backend server...
start "PalmExitGarage Backend" cmd /k "cd server && npm start"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend
echo Starting frontend...
start "PalmExitGarage Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ================================================================
echo    PalmExitGarage Started Successfully!
echo ================================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5174
echo.
echo Opening application in your default browser...
timeout /t 5 /nobreak >nul
start http://localhost:5174
echo.
echo To stop PalmExitGarage, close both terminal windows
echo or run STOP_PALMEXITGARAGE_MYSQL.bat
echo.
