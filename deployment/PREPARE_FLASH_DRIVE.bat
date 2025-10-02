@echo off
cls
echo ================================================================
echo    PalmExitGarage - Preparing Portable Flash Drive Package
echo ================================================================
echo.
echo This script will prepare the PalmExitGarage installation package
echo for copying to a USB flash drive.
echo.
pause

:: Set variables
set SOURCE_DIR=%~dp0..
set DEST_DIR=%USERPROFILE%\Desktop\PalmExitGarage_FlashDrive
set TIMESTAMP=%DATE:~-4%_%DATE:~4,2%_%DATE:~7,2%_%TIME:~0,2%_%TIME:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo Preparing package in: %DEST_DIR%
echo.

:: Clean up destination directory
if exist "%DEST_DIR%" (
    echo Cleaning previous package...
    rmdir /s /q "%DEST_DIR%"
)

:: Create destination directory
mkdir "%DEST_DIR%"

echo [1/5] Copying application files...
:: Copy core application files
xcopy "%SOURCE_DIR%\frontend" "%DEST_DIR%\frontend\" /E /I /H /Y >nul
xcopy "%SOURCE_DIR%\server" "%DEST_DIR%\server\" /E /I /H /Y >nul

:: Exclude node_modules to save space - they will be reinstalled
if exist "%DEST_DIR%\frontend\node_modules" rmdir /s /q "%DEST_DIR%\frontend\node_modules"
if exist "%DEST_DIR%\server\node_modules" rmdir /s /q "%DEST_DIR%\server\node_modules"

:: Copy configuration files
copy "%SOURCE_DIR%\docker-compose.yml" "%DEST_DIR%\" >nul
copy "%SOURCE_DIR%\package.json" "%DEST_DIR%\" >nul 2>nul
copy "%SOURCE_DIR%\README.md" "%DEST_DIR%\" >nul 2>nul

echo [2/5] Copying installation scripts...
:: Copy deployment files
xcopy "%SOURCE_DIR%\deployment" "%DEST_DIR%\deployment\" /E /I /Y >nul

echo [3/5] Copying database backup...
:: Ensure database backup is current
echo Creating fresh database backup with all professional data...
docker ps | findstr "palmexitgarage-db" >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Database container is not running!
    echo Please start PalmExitGarage first to ensure the database is available.
    echo Run: START_PALMEXITGARAGE.bat
    pause
    exit /b 1
)
docker exec palmexitgarage-db mysqldump -u root -pexample palmexitgarage > "%DEST_DIR%\deployment\database_backup\palmexitgarage_backup.sql" 2>nul
if %errorLevel% neq 0 (
    echo ERROR: Failed to create database backup!
    echo Please ensure the database is running and accessible.
    pause
    exit /b 1
)

echo [4/5] Creating package information...
:: Create a package info file
echo PalmExitGarage Portable Installation Package > "%DEST_DIR%\PACKAGE_INFO.txt"
echo ============================================= >> "%DEST_DIR%\PACKAGE_INFO.txt"
echo. >> "%DEST_DIR%\PACKAGE_INFO.txt"
echo Package Created: %DATE% %TIME% >> "%DEST_DIR%\PACKAGE_INFO.txt"
echo Package Version: 1.1.0 >> "%DEST_DIR%\PACKAGE_INFO.txt"
echo. >> "%DEST_DIR%\PACKAGE_INFO.txt"
echo INSTALLATION INSTRUCTIONS: >> "%DEST_DIR%\PACKAGE_INFO.txt"
echo 1. Copy this entire folder to the target computer >> "%DEST_DIR%\PACKAGE_INFO.txt"
echo 2. Right-click deployment\INSTALL_PALMEXITGARAGE.bat >> "%DEST_DIR%\PACKAGE_INFO.txt"
echo 3. Select "Run as administrator" >> "%DEST_DIR%\PACKAGE_INFO.txt"
echo 4. Follow the installation prompts >> "%DEST_DIR%\PACKAGE_INFO.txt"
echo. >> "%DEST_DIR%\PACKAGE_INFO.txt"
echo For detailed instructions, see deployment\README.md >> "%DEST_DIR%\PACKAGE_INFO.txt"

:: Get package size
echo [5/5] Calculating package size...
for /f "tokens=3" %%i in ('dir "%DEST_DIR%" /s /-c ^| find "bytes"') do set PACKAGE_SIZE=%%i

echo.
echo ================================================================
echo    Package Preparation Complete!
echo ================================================================
echo.
echo Package Location: %DEST_DIR%
echo Package Size: %PACKAGE_SIZE% bytes
echo.
echo CONTENTS SUMMARY:
echo - PalmExitGarage Frontend (React application)
echo - PalmExitGarage Backend (Node.js server)
echo - Docker configuration files
echo - Complete database backup (6,057 vehicles, 88 parts, 2 test customers)
echo - Database backup and restore system
echo - Installation scripts (Node.js, Docker Desktop)
echo - Startup/shutdown scripts
echo - Color-coded work order status system
echo - Smart inventory management with auto-deduction
echo - Complete documentation
echo.
echo FLASH DRIVE INSTRUCTIONS:
echo 1. Copy the entire "%DEST_DIR%" folder to your flash drive
echo 2. On the target computer, copy the folder to the desktop
echo 3. Right-click deployment\INSTALL_PALMEXITGARAGE.bat
echo 4. Select "Run as administrator"
echo.
echo The package is ready for deployment!
echo.
pause

:: Open the destination folder
explorer "%DEST_DIR%"