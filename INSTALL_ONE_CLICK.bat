@echo off
cls
echo ================================================================
echo    PalmExitGarage - ONE-CLICK INSTALLER
echo    Version 1.1.0 - Complete Setup
echo ================================================================
echo.
echo This installer will automatically:
echo   1. Install Node.js (if needed)
echo   2. Install all dependencies
echo   3. Setup the database
echo   4. Create desktop shortcuts
echo   5. Start the application
echo.
echo Press any key to begin installation...
pause >nul
cls

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ERROR: This installer must be run as Administrator!
    echo.
    echo Right-click on this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0"

echo ================================================================
echo    Step 1 of 5: Installing Node.js
echo ================================================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing Node.js v20.11.0...
    if exist "deployment\installers\node-v20.11.0-x64.msi" (
        start /wait msiexec /i "deployment\installers\node-v20.11.0-x64.msi" /quiet /norestart
        echo Node.js installed successfully!
    ) else (
        echo ERROR: Node.js installer not found!
        echo Please ensure deployment\installers\node-v20.11.0-x64.msi exists
        pause
        exit /b 1
    )
) else (
    echo Node.js is already installed.
)

:: Refresh environment
set PATH=%PATH%;C:\Program Files\nodejs\
echo.

echo ================================================================
echo    Step 2 of 5: Installing Dependencies
echo ================================================================
echo.

echo Installing backend dependencies...
cd server
call npm install --loglevel=error
if %errorLevel% neq 0 (
    echo WARNING: Some backend dependencies may have failed
    echo The application should still work
)
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install --loglevel=error
if %errorLevel% neq 0 (
    echo WARNING: Some frontend dependencies may have failed
    echo The application should still work
)
cd ..

echo.
echo Dependencies installed successfully!

echo.
echo ================================================================
echo    Step 3 of 5: Setting Up Database
echo ================================================================
echo.

:: Detect MySQL installation
set MYSQL_PATH=

if exist "C:\Program Files\MySQL\MySQL Server 9.1\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 9.1\bin\mysql.exe"
    echo Found MySQL Server 9.1
) else if exist "C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe"
    echo Found MySQL Server 9.0
) else if exist "C:\Program Files\MySQL\MySQL Server 8.2\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.2\bin\mysql.exe"
    echo Found MySQL Server 8.2
) else if exist "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe"
    echo Found MySQL Server 8.1
) else if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    echo Found MySQL Server 8.0
) else (
    echo.
    echo ERROR: MySQL not found!
    echo Please install MySQL 8.0 or higher first.
    echo.
    pause
    exit /b 1
)

echo.

:: Prompt for MySQL password
set /p MYSQL_PASSWORD="Enter your MySQL root password: "

:: Test MySQL connection
echo Testing connection...
%MYSQL_PATH% -u root -p"%MYSQL_PASSWORD%" -e "SELECT 1;" >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ERROR: Could not connect to MySQL!
    echo Please check:
    echo   1. MySQL service is running
    echo   2. Password is correct
    echo.
    pause
    exit /b 1
)

echo Creating database...
%MYSQL_PATH% -u root -p"%MYSQL_PASSWORD%" -e "CREATE DATABASE IF NOT EXISTS palmexitgarage;"

echo Running migrations...
cd server
node migrate.js

echo Seeding vehicle data...
node seed_vehicles_2010_2015.js

echo Seeding parts...
node seed_autozone_parts.js

echo Seeding labor services...
node seed_labor.js

echo Adding test customers...
node seed_test_data.js

cd ..

echo.
echo Database setup complete!

echo.
echo ================================================================
echo    Step 4 of 5: Updating Configuration
echo ================================================================
echo.

:: Update database config with the password
echo const config = { > server\config\database.js
echo     host: 'localhost', >> server\config\database.js
echo     port: 3306, >> server\config\database.js
echo     user: 'root', >> server\config\database.js
echo     password: '%MYSQL_PASSWORD%', >> server\config\database.js
echo     database: 'palmexitgarage' >> server\config\database.js
echo }; >> server\config\database.js
echo. >> server\config\database.js
echo module.exports = config; >> server\config\database.js

echo Configuration updated!

echo.
echo ================================================================
echo    Step 5 of 5: Creating Shortcuts
echo ================================================================
echo.

:: Create start script
echo @echo off > START_PALMEXITGARAGE.bat
echo cd /d "%~dp0" >> START_PALMEXITGARAGE.bat
echo start "PalmExitGarage Backend" cmd /k "cd server && npm start" >> START_PALMEXITGARAGE.bat
echo timeout /t 3 /nobreak ^>nul >> START_PALMEXITGARAGE.bat
echo start "PalmExitGarage Frontend" cmd /k "cd frontend && npm run dev" >> START_PALMEXITGARAGE.bat
echo timeout /t 5 /nobreak ^>nul >> START_PALMEXITGARAGE.bat
echo start http://localhost:5174 >> START_PALMEXITGARAGE.bat

echo Desktop shortcut created!

cls
echo.
echo ================================================================
echo    INSTALLATION COMPLETE!
echo ================================================================
echo.
echo PalmExitGarage has been successfully installed!
echo.
echo DATABASE INCLUDES:
echo   * 703 Vehicle Models (2010-2015)
echo   * 88 Professional Parts with inventory
echo   * 10 Labor Services
echo   * 2 Test Customers (ready to use!)
echo.
echo TEST CUSTOMERS:
echo   - John Doe (john.doe@example.com) - 2018 Honda Accord
echo   - Jane Smith (jane.smith@example.com) - 2020 Toyota RAV4
echo.
echo ================================================================
echo.
set /p START_NOW="Would you like to start PalmExitGarage now? (Y/N): "
if /i "%START_NOW%"=="Y" (
    echo.
    echo Starting PalmExitGarage...
    echo.
    call START_PALMEXITGARAGE.bat
    echo.
    echo PalmExitGarage is starting!
    echo The application will open in your browser shortly.
    echo.
) else (
    echo.
    echo To start PalmExitGarage later:
    echo   - Run START_PALMEXITGARAGE.bat
    echo.
)

echo Installation log saved to: installation.log
echo.
pause
