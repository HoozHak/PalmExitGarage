@echo off
cls
echo ================================================================
echo    PalmExitGarage Installation Test
echo ================================================================
echo.
echo This script tests your PalmExitGarage installation.
echo.

:: Navigate to deployment directory
cd /d "%~dp0"

echo [1/5] Testing Docker availability...
docker --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Docker not found or not running
    echo Please ensure Docker Desktop is installed and running.
    goto :ERROR
) else (
    echo ✅ Docker is available
)
echo.

echo [2/5] Testing Node.js availability...  
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Node.js not found
    echo Please ensure Node.js is installed and in your PATH.
    goto :ERROR
) else (
    echo ✅ Node.js is available
    node --version
)
echo.

echo [3/5] Testing database container...
docker ps | findstr "palmexitgarage-db" >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️ Database container not running
    echo This is normal if you haven't started PalmExitGarage yet.
    echo The database will start automatically when you run START_PALMEXITGARAGE.bat
) else (
    echo ✅ Database container is running
    
    :: Test database connection
    echo Testing database connection...
    docker exec palmexitgarage-db mysqladmin ping -h localhost -u root -pexample >nul 2>&1
    if %errorLevel% neq 0 (
        echo ⚠️ Database not responding (may be starting up)
    ) else (
        echo ✅ Database is responding
        
        :: Quick database content check
        echo Checking database content...
        docker exec palmexitgarage-db mysql -u root -pexample palmexitgarage -e "SELECT COUNT(*) as vehicle_count FROM vehicle_reference;" 2>nul | findstr -v "vehicle_count" | findstr "[0-9]" >nul
        if %errorLevel% neq 0 (
            echo ⚠️ Database may be empty (normal for fresh installation)
        ) else (
            echo ✅ Database contains vehicle data
        )
    )
)
echo.

echo [4/5] Testing application files...
cd ..
if not exist "server\package.json" (
    echo ❌ Server files missing
    goto :ERROR
) else (
    echo ✅ Server files present
)

if not exist "frontend\package.json" (
    echo ❌ Frontend files missing  
    goto :ERROR
) else (
    echo ✅ Frontend files present
)

:: Check if dependencies are installed
if not exist "server\node_modules" (
    echo ⚠️ Server dependencies not installed
    echo Run the installer again or manually run: cd server && npm install
) else (
    echo ✅ Server dependencies installed
)

if not exist "frontend\node_modules" (
    echo ⚠️ Frontend dependencies not installed
    echo Run the installer again or manually run: cd frontend && npm install
) else (
    echo ✅ Frontend dependencies installed
)

cd deployment
echo.

echo [5/5] Testing shortcuts...
if exist "%USERPROFILE%\Desktop\Start PalmExitGarage.lnk" (
    echo ✅ Desktop shortcut exists
) else (
    echo ⚠️ Desktop shortcut not found
    echo Run create_shortcuts.bat to create shortcuts
)
echo.

echo ================================================================
echo    🎉 INSTALLATION TEST COMPLETED!
echo ================================================================
echo.
echo Your PalmExitGarage installation appears to be working correctly.
echo.
echo To start PalmExitGarage:
echo   1. Double-click the "Start PalmExitGarage" desktop shortcut
echo   2. OR run: START_PALMEXITGARAGE.bat
echo   3. Wait for all services to start (may take 1-2 minutes)
echo   4. Open your browser to: http://localhost:3000
echo.
echo If you experience any issues, check the troubleshooting section
echo in the README.md file.
echo.
goto :END

:ERROR
echo.
echo ================================================================
echo    ❌ INSTALLATION TEST FAILED
echo ================================================================ 
echo.
echo Please run the installer again or check the error messages above.
echo Right-click INSTALL_PALMEXITGARAGE.bat and select "Run as administrator"
echo.

:END
pause