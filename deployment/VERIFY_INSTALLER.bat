@echo off
cls
echo ================================================================
echo    PalmExitGarage Installer Verification
echo ================================================================
echo.
echo This script verifies that the installer components are ready.
echo.

set ERRORS=0

:: Check current directory structure
echo [1/6] Checking directory structure...
cd /d "%~dp0"
if not exist "..\server\package.json" (
    echo ERROR: Server package.json not found at ..\server\package.json
    set /a ERRORS+=1
) else (
    echo ✓ Server package.json found
)

if not exist "..\frontend\package.json" (
    echo ERROR: Frontend package.json not found at ..\frontend\package.json  
    set /a ERRORS+=1
) else (
    echo ✓ Frontend package.json found
)

if not exist "..\docker-compose.yml" (
    echo ERROR: Docker compose file not found at ..\docker-compose.yml
    set /a ERRORS+=1
) else (
    echo ✓ Docker compose file found
)

echo.

:: Check database backup
echo [2/6] Checking database backup...
if not exist "database_backup\palmexitgarage_backup.sql" (
    echo ERROR: Database backup not found at database_backup\palmexitgarage_backup.sql
    set /a ERRORS+=1
) else (
    echo ✓ Database backup found
    for %%A in (database_backup\palmexitgarage_backup.sql) do echo   Size: %%~zA bytes
)
echo.

:: Check installer scripts
echo [3/6] Checking installer scripts...
set SCRIPTS=install_nodejs.bat install_docker.bat setup_database.bat create_shortcuts.bat
for %%S in (%SCRIPTS%) do (
    if not exist "%%S" (
        echo ERROR: Missing script: %%S
        set /a ERRORS+=1
    ) else (
        echo ✓ Found: %%S
    )
)
echo.

:: Check Node.js availability (if installed)
echo [4/6] Checking Node.js availability...
node --version >nul 2>&1
if %errorLevel% equ 0 (
    node --version
    npm --version
    echo ✓ Node.js and npm are available
) else (
    echo ⚠ Node.js not currently installed (will be installed by installer)
)
echo.

:: Check Docker availability (if installed)
echo [5/6] Checking Docker availability...
docker --version >nul 2>&1
if %errorLevel% equ 0 (
    docker --version
    echo ✓ Docker is available
    
    :: Check if our database container exists
    docker ps -a | findstr "palmexitgarage-db" >nul 2>&1
    if %errorLevel% equ 0 (
        echo ✓ PalmExitGarage database container exists
    ) else (
        echo ⚠ PalmExitGarage database container not found (will be created by installer)
    )
) else (
    echo ⚠ Docker not currently installed (will be installed by installer)
)
echo.

:: Check frontend package.json for correct scripts
echo [6/6] Checking frontend configuration...
cd ..\frontend
findstr /c:"\"dev\":" package.json >nul 2>&1
if %errorLevel% equ 0 (
    echo ✓ Frontend has 'dev' script configured correctly
) else (
    echo ERROR: Frontend package.json missing 'dev' script
    set /a ERRORS+=1
)

findstr /c:"vite" package.json >nul 2>&1
if %errorLevel% equ 0 (
    echo ✓ Frontend is configured with Vite
) else (
    echo WARNING: Frontend may not be configured with Vite
)

:: Return to deployment directory
cd ..\deployment
echo.

:: Show results
echo ================================================================
if %ERRORS% equ 0 (
    echo    ✅ VERIFICATION PASSED - Installer is ready!
    echo ================================================================
    echo.
    echo All components are properly configured. The installer should work correctly.
    echo.
    echo To run the full installation:
    echo   Right-click INSTALL_PALMEXITGARAGE.bat and select "Run as administrator"
) else (
    echo    ❌ VERIFICATION FAILED - %ERRORS% error(s) found
    echo ================================================================
    echo.
    echo Please fix the errors above before running the installer.
)
echo.
pause