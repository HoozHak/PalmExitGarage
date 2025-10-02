@echo off
cls
echo ================================================================
echo    Starting PalmExitGarage - MySQL Version
echo ================================================================
echo.

:: Navigate to project root
cd /d "%~dp0.."

:: Check if MySQL service is running
echo Checking MySQL service...
sc query MySQL91 | find "RUNNING" >nul
if %errorLevel% neq 0 (
    echo MySQL service is not running. Starting MySQL...
    net start MySQL91
    if %errorLevel% neq 0 (
        echo ERROR: Could not start MySQL service!
        echo Please start MySQL manually or check Windows Services.
        pause
        exit /b 1
    )
)
echo MySQL is running.
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
