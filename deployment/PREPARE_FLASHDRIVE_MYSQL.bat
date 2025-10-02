@echo off
cls
echo ================================================================
echo    PalmExitGarage - Preparing Flash Drive Package
echo    MySQL Version - Local Database
echo ================================================================
echo.
echo This script will prepare the PalmExitGarage installation package
echo for copying to a USB flash drive.
echo.
pause

:: Set variables
set SOURCE_DIR=%~dp0..
set DEST_DIR=%USERPROFILE%\Desktop\PalmExitGarage_MySQL_FlashDrive
set TIMESTAMP=%DATE:~-4%_%DATE:~4,2%_%DATE:~7,2%

echo.
echo Preparing package in: %DEST_DIR%
echo.

:: Clean up destination directory
if exist "%DEST_DIR%" (
    echo Cleaning previous package...
    rmdir /s /q "%DEST_DIR%"
)

:: Create destination directory
mkdir "%DEST_DIR%"

echo [1/6] Copying application files...
:: Copy core application files
xcopy "%SOURCE_DIR%\frontend" "%DEST_DIR%\frontend\" /E /I /H /Y /EXCLUDE:%~dp0exclude.txt >nul
xcopy "%SOURCE_DIR%\server" "%DEST_DIR%\server\" /E /I /H /Y /EXCLUDE:%~dp0exclude.txt >nul

:: Exclude node_modules and backups to save space
if exist "%DEST_DIR%\frontend\node_modules" rmdir /s /q "%DEST_DIR%\frontend\node_modules"
if exist "%DEST_DIR%\server\node_modules" rmdir /s /q "%DEST_DIR%\server\node_modules"
if exist "%DEST_DIR%\server\backups" rmdir /s /q "%DEST_DIR%\server\backups"

:: Create backups directory
mkdir "%DEST_DIR%\server\backups"

echo [2/6] Copying configuration files...
copy "%SOURCE_DIR%\package.json" "%DEST_DIR%\" >nul 2>nul
copy "%SOURCE_DIR%\README.md" "%DEST_DIR%\" >nul 2>nul
copy "%SOURCE_DIR%\.gitignore" "%DEST_DIR%\" >nul 2>nul
copy "%SOURCE_DIR%\download-mysql.ps1" "%DEST_DIR%\" >nul 2>nul

echo [3/6] Copying documentation...
xcopy "%SOURCE_DIR%\Documentation" "%DEST_DIR%\Documentation\" /E /I /Y >nul 2>nul

echo [4/6] Copying installation scripts...
:: Copy deployment files
xcopy "%SOURCE_DIR%\deployment" "%DEST_DIR%\deployment\" /E /I /Y >nul

echo [5/6] Creating package information...
:: Create a package info file
echo PalmExitGarage Portable Installation Package > "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo MySQL Version - Local Database >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo ============================================= >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo Package Created: %DATE% %TIME% >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo Package Version: 1.1.0 >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo ============================================= >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo INSTALLATION INSTRUCTIONS >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo ============================================= >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo STEP 1: Copy Files >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo   Copy this entire folder to the target computer >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo   (Recommended location: C:\PalmExitGarage) >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo STEP 2: Install Prerequisites >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo   Right-click deployment\INSTALL_MYSQL.bat >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo   Select "Run as administrator" >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo STEP 3: Follow Installation Prompts >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo   - Node.js will be installed automatically >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo   - MySQL must be installed (script will guide you) >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo   - All dependencies will be installed >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo   - Database will be created and seeded >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo STEP 4: Start Application >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo   Use desktop shortcut or run: >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo   deployment\START_PALMEXITGARAGE_MYSQL.bat >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo ============================================= >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo PACKAGE CONTENTS >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo ============================================= >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * Frontend Application (React web interface) >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * Backend Server (Node.js/Express API) >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * Database Scripts (703 vehicles, 88 parts) >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * Test Customer Data (2 sample customers) >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * Installation Scripts (automated setup) >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * Documentation (complete user guides) >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo ============================================= >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo DATABASE FEATURES >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo ============================================= >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * 703 Vehicle Models (2010-2015) >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * 88 Professional Parts with inventory >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * 10 Labor Services >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * 2 Test Customers: >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo   - John Doe (2018 Honda Accord) >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo   - Jane Smith (2020 Toyota RAV4) >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * Backup and Restore System >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * Color-coded Work Order Status >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * Smart Inventory Management >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo ============================================= >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo SYSTEM REQUIREMENTS >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo ============================================= >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * Windows 10 or Windows 11 >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * 4GB RAM minimum (8GB recommended) >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * 2GB free disk space >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * Administrator rights for installation >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo * Internet connection for initial setup >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo. >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"
echo For detailed information, see README.md >> "%DEST_DIR%\INSTALL_INSTRUCTIONS.txt"

:: Get package size
echo [6/6] Calculating package size...
echo.

echo ================================================================
echo    Package Preparation Complete!
echo ================================================================
echo.
echo Package Location: %DEST_DIR%
echo.
echo CONTENTS SUMMARY:
echo - PalmExitGarage Frontend (React application)
echo - PalmExitGarage Backend (Node.js server)
echo - MySQL Configuration and Scripts
echo - Complete database seeding scripts
echo - 703 Vehicle models, 88 Parts, 10 Labor services
echo - 2 Test customers with vehicles
echo - Installation scripts (Node.js, MySQL)
echo - Startup/shutdown scripts
echo - Color-coded work order status system
echo - Smart inventory management with auto-deduction
echo - Database backup and restore system
echo - Complete documentation
echo.
echo FLASH DRIVE INSTRUCTIONS:
echo 1. Copy the entire "%DEST_DIR%" folder to your flash drive
echo 2. On the target computer, copy the folder to C:\
echo 3. Right-click deployment\INSTALL_MYSQL.bat
echo 4. Select "Run as administrator"
echo 5. Follow the installation prompts
echo.
echo The package is ready for deployment!
echo.
pause

:: Open the destination folder
explorer "%DEST_DIR%"
