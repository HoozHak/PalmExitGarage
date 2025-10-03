@echo off
echo Setting up PalmExitGarage MySQL database...

:: Navigate to project root
cd /d "%~dp0.."

:: Check if MySQL 8.0.x is installed
echo Checking for MySQL installation...

set MYSQL_PATH=
set WRONG_VERSION=0

:: Check for WRONG versions (should not be installed)
if exist "C:\Program Files\MySQL\MySQL Server 9.1\bin\mysql.exe" set WRONG_VERSION=1
if exist "C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe" set WRONG_VERSION=1
if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" set WRONG_VERSION=1
if exist "C:\Program Files\MySQL\MySQL Server 8.2\bin\mysql.exe" set WRONG_VERSION=1
if exist "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe" set WRONG_VERSION=1

if %WRONG_VERSION% equ 1 (
    echo.
    echo ============================================================
    echo ERROR: INCOMPATIBLE MySQL VERSION DETECTED!
    echo ============================================================
    echo.
    echo You have MySQL 8.4.x, 9.x, or another incompatible version.
    echo PalmExitGarage requires MySQL 8.0.x ONLY!
    echo.
    echo Please uninstall the current version and install MySQL 8.0.40 or 8.0.43
    echo See: ..\MYSQL_VERSION_QUICK_REFERENCE.txt
    echo.
    pause
    exit /b 1
)

:: Check for CORRECT version (MySQL 8.0.x)
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    echo Found MySQL Server 8.0.x ✓
    goto :mysql_found
)

:: MySQL 8.0.x not found
echo.
echo ============================================================
echo ERROR: MySQL 8.0.x is not installed!
echo ============================================================
echo.
echo CRITICAL: You must install MySQL 8.0.x (NOT 8.4.x or 9.x!)
echo.
echo RECOMMENDED: MySQL 8.0.40 or MySQL 8.0.43
echo.
echo Download from: https://dev.mysql.com/downloads/installer/
echo   Click "Looking for previous GA versions?"
echo   Select "8.0.40" or latest 8.0.x
echo.
echo See: ..\MYSQL_VERSION_QUICK_REFERENCE.txt for detailed instructions
echo.
pause
exit /b 1

:mysql_found
echo.

:: Prompt for MySQL root password
set /p MYSQL_PASSWORD="Enter MySQL root password: "

:: Test connection
echo Testing MySQL connection...
%MYSQL_PATH% -u root -p"%MYSQL_PASSWORD%" -e "SELECT 1;" >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Could not connect to MySQL!
    echo Please check your password and try again.
    pause
    exit /b 1
)

echo Connection successful!
echo.

:: Create database
echo Creating palmexitgarage database...
%MYSQL_PATH% -u root -p"%MYSQL_PASSWORD%" -e "CREATE DATABASE IF NOT EXISTS palmexitgarage;"
if %errorLevel% neq 0 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)

echo Database created successfully!
echo.

:: Run migrations
echo Creating database tables...
cd server
node migrate.js
if %errorLevel% neq 0 (
    echo ERROR: Failed to create tables
    pause
    exit /b 1
)

echo Tables created successfully!
echo.

:: Seed vehicle data
echo Seeding vehicle reference data (this may take a moment)...
node seed_vehicles_2010_2015.js
if %errorLevel% neq 0 (
    echo WARNING: Vehicle data seeding had issues, but continuing...
)

:: Seed parts data
echo Seeding parts catalog...
node seed_autozone_parts.js
if %errorLevel% neq 0 (
    echo WARNING: Parts data seeding had issues, but continuing...
)

:: Seed labor data
echo Seeding labor services...
node seed_labor.js
if %errorLevel% neq 0 (
    echo WARNING: Labor data seeding had issues, but continuing...
)

:: Seed test customers
echo Adding test customer data...
node seed_test_data.js
if %errorLevel% neq 0 (
    echo WARNING: Test data seeding had issues, but continuing...
)

cd ..

echo.
echo ================================================================
echo    PalmExitGarage MySQL Database Setup Complete!
echo ================================================================
echo.
echo Database 'palmexitgarage' is ready with:
echo   - Complete database schema
echo   - 703 Vehicle models (2010-2015)
echo   - 88 Professional parts with inventory
echo   - 10 Labor services
echo   - 2 Test customers with vehicles
echo.
echo Test Customers:
echo   - John Doe (2018 Honda Accord) - john.doe@example.com
echo   - Jane Smith (2020 Toyota RAV4) - jane.smith@example.com
echo.

exit /b 0
