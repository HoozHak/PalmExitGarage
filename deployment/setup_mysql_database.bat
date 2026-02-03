@echo off
echo Setting up PalmExitGarage MySQL database...

:: Navigate to project root
cd /d "%~dp0.."

:: Detect MySQL installation (supports 8.0/8.4/9.x)
echo Detecting MySQL installation...

set MYSQL_PATH=

if exist "C:\Program Files\MySQL\MySQL Server 9.1\bin\mysql.exe" set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 9.1\bin\mysql.exe"
if not defined MYSQL_PATH if exist "C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe" set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe"
if not defined MYSQL_PATH if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
if not defined MYSQL_PATH if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not defined MYSQL_PATH (
    where mysql >nul 2>&1
    if %errorLevel% equ 0 set MYSQL_PATH=mysql
)

if not defined MYSQL_PATH (
    echo.
    echo ============================================================
    echo ERROR: MySQL client not found!
    echo ============================================================
    echo.
    echo Please install MySQL (8.0/8.4/9.x) or add it to your PATH.
    echo Download: https://dev.mysql.com/downloads/installer/
    echo.
    pause
    exit /b 1
)

echo Found MySQL client: %MYSQL_PATH%

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

echo Applying schema fixes...
node migrations\fix_work_orders_schema.js

echo Restoring estimate inventory (safety)...
node migrations\restore_estimate_inventory.js

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
