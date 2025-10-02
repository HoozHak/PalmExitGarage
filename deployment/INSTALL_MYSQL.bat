@echo off
cls
echo ================================================================
echo    PalmExitGarage - Professional Auto Repair Shop System
echo    MySQL Version - Local Database Installation
echo ================================================================
echo.
echo This installer will set up PalmExitGarage on your computer.
echo It will install all necessary components including:
echo   - Node.js (if needed)
echo   - MySQL (if needed - or use existing installation)
echo   - PalmExitGarage Application
echo   - Professional database with 703 vehicles and 88+ parts
echo   - 2 Test customers for immediate testing
echo.
pause
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This installer must be run as Administrator!
    echo Right-click on this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Starting PalmExitGarage installation...
echo.

:: Set the installation directory to the current script location
set INSTALL_DIR=%~dp0
cd /d "%INSTALL_DIR%"

:: Check if Node.js is installed
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Node.js not found. Installing Node.js...
    call install_nodejs.bat
    if %errorLevel% neq 0 (
        echo ERROR: Failed to install Node.js
        pause
        exit /b 1
    )
) else (
    echo Node.js is already installed.
)
echo.

:: Check if MySQL is installed
echo [2/4] Checking MySQL installation...
"C:\Program Files\MySQL\MySQL Server 9.1\bin\mysql.exe" --version >nul 2>&1
if %errorLevel% neq 0 (
    echo MySQL not found.
    echo.
    echo OPTION 1: Install MySQL automatically
    echo   Run the PowerShell script: download-mysql.ps1
    echo.
    echo OPTION 2: Install MySQL manually
    echo   Download from: https://dev.mysql.com/downloads/mysql/
    echo.
    echo After installing MySQL, run this installer again.
    pause
    exit /b 1
) else (
    echo MySQL is already installed.
)
echo.

:: Install application dependencies
echo [3/4] Installing application dependencies...

:: Navigate to project root (parent of deployment folder)
cd ..

:: Install server dependencies
echo Installing backend dependencies...
cd server
call npm install
if %errorLevel% neq 0 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)

:: Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorLevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

:: Return to deployment directory
cd ..\deployment
echo Application dependencies installed successfully.
echo.

:: Set up database
echo [4/4] Setting up database...
call setup_mysql_database.bat
if %errorLevel% neq 0 (
    echo ERROR: Failed to set up database
    pause
    exit /b 1
)
echo Database setup completed successfully.
echo.

:: Create desktop shortcuts
echo Creating shortcuts...
call create_shortcuts.bat
echo Shortcuts created successfully.
echo.

echo ================================================================
echo    PalmExitGarage Installation Complete!
echo ================================================================
echo.
echo The application has been successfully installed with:
echo   * 703 Vehicle Models (2010-2015)
echo   * 88+ Professional Parts (AutoZone business pricing)
echo   * 2 Test Customers (John Doe and Jane Smith) with vehicles
echo   * Automatic inventory management with intelligent deduction
echo   * Complete work order and customer management system
echo   * Professional email automation
echo   * Database backup and restore capabilities
echo   * Local MySQL database
echo.
echo To start PalmExitGarage:
echo   - Double-click the "Start PalmExitGarage" desktop shortcut
echo   - OR run: START_PALMEXITGARAGE_MYSQL.bat
echo.
echo The application will be available at:
echo   http://localhost:5174
echo.
echo Thank you for choosing PalmExitGarage Professional!
echo.
pause
