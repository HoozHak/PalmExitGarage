@echo off
cls
echo ================================================================
echo    Starting PalmExitGarage - Auto Repair Shop System
echo ================================================================
echo.

:: Navigate to the correct directory
cd /d "%~dp0"

:: Check if Docker is running
echo Checking Docker status...
docker ps >nul 2>&1
if %errorLevel% neq 0 (
    echo Docker is not running. Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    
    echo Waiting for Docker Desktop to start...
    :WAIT_FOR_DOCKER
    timeout /t 5 /nobreak >nul
    docker ps >nul 2>&1
    if %errorLevel% neq 0 (
        echo Still waiting for Docker...
        goto WAIT_FOR_DOCKER
    )
    echo Docker Desktop is now running.
)

:: Start the database container
echo Starting database...
docker-compose -f ../docker-compose.yml up -d

:: Wait for database to be ready
echo Waiting for database to be ready...
:WAIT_FOR_DB
timeout /t 3 /nobreak >nul
docker exec palmexitgarage-db mysqladmin ping -h localhost -u root -pexample >nul 2>&1
if %errorLevel% neq 0 goto WAIT_FOR_DB
echo Database is ready.

:: Start the backend server
echo Starting backend server...
cd ../server
start "PalmExitGarage Server" cmd /c "npm start"

:: Wait a moment for server to start
timeout /t 3 /nobreak >nul

:: Start the frontend
echo Starting frontend...
cd ../frontend
start "PalmExitGarage Frontend" cmd /c "npm run dev"

:: Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

:: Open browser
echo Opening PalmExitGarage in your default browser...
timeout /t 3 /nobreak >nul
start http://localhost:5174

echo.
echo ================================================================
echo    PalmExitGarage is now running!
echo ================================================================
echo.
echo Frontend: http://localhost:5174
echo Backend:  http://localhost:5000
echo.
echo To stop PalmExitGarage, close this window or run STOP_PALMEXITGARAGE.bat
echo.
echo Press any key to minimize this window...
pause >nul

:: Keep the script running to maintain the services
:KEEP_RUNNING
timeout /t 30 /nobreak >nul
goto KEEP_RUNNING