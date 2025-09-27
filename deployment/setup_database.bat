@echo off
echo Setting up PalmExitGarage database...

:: Check if Docker is running
docker ps >nul 2>&1
if %errorLevel% neq 0 (
    echo Docker is not running. Starting Docker Desktop...
    echo Please wait for Docker Desktop to start completely...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    
    :: Wait for Docker to start
    echo Waiting for Docker to start (this may take 1-2 minutes)...
    :WAIT_FOR_DOCKER
    timeout /t 10 /nobreak >nul
    docker ps >nul 2>&1
    if %errorLevel% neq 0 goto WAIT_FOR_DOCKER
    echo Docker is now running.
)

:: Navigate to the correct directory
cd /d "%~dp0"

:: Check if database container is already running
docker ps | findstr "palmexitgarage-db" >nul 2>&1
if %errorLevel% equ 0 (
    echo Database container is already running. Stopping it to rebuild...
    docker-compose -f ../docker-compose.yml down
)

echo Creating database volume...
docker volume create palmexitgarage_db_data >nul 2>&1

echo Starting database container...
docker-compose -f ../docker-compose.yml up -d

echo Waiting for database to be ready...
:WAIT_FOR_DB
timeout /t 5 /nobreak >nul
docker exec palmexitgarage-db mysqladmin ping -h localhost -u root -pexample >nul 2>&1
if %errorLevel% neq 0 goto WAIT_FOR_DB

echo Database is ready. Importing data...

:: Check if database backup exists
if not exist "database_backup\palmexitgarage_backup.sql" (
    echo ERROR: Database backup file not found!
    echo Please ensure database_backup\palmexitgarage_backup.sql exists.
    echo.
    echo If you need to create a fresh database, please run the seed scripts manually:
    echo   1. node ../server/migrate.js
    echo   2. node ../server/seed_comprehensive_vehicles.js
    echo   3. node ../server/seed_autozone_parts.js
    echo.
    pause
    exit /b 1
)

:: Import the database backup
echo Importing database schema and data...
echo This may take a moment for 6,000+ vehicles and professional parts...
docker exec -i palmexitgarage-db mysql -u root -pexample palmexitgarage < database_backup\palmexitgarage_backup.sql

if %errorLevel% neq 0 (
    echo ERROR: Failed to import database
    exit /b 1
)

echo Database setup completed successfully!
echo.
echo ================================================================
echo    PalmExitGarage Professional Database Ready!
echo ================================================================
echo Database contains:
docker exec palmexitgarage-db mysql -u root -pexample palmexitgarage -e "SELECT 'CUSTOMERS' as table_name, COUNT(*) as count FROM customers UNION SELECT 'VEHICLES', COUNT(*) FROM vehicles UNION SELECT 'VEHICLE_REFERENCE', COUNT(*) FROM vehicle_reference UNION SELECT 'PARTS', COUNT(*) FROM parts UNION SELECT 'LABOR', COUNT(*) FROM labor;" 2>nul
echo.
echo Verifying Honda Crosstour availability...
docker exec palmexitgarage-db mysql -u root -pexample palmexitgarage -e "SELECT COUNT(*) as honda_crosstour_models FROM vehicle_reference WHERE make = 'Honda' AND model LIKE '%Crosstour%';" 2>nul

exit /b 0