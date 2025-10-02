@echo off
echo ================================================================
echo    Stopping PalmExitGarage - MySQL Version
echo ================================================================
echo.

:: Kill Node.js processes
echo Stopping PalmExitGarage services...
taskkill /FI "WINDOWTITLE eq PalmExitGarage Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq PalmExitGarage Frontend*" /F >nul 2>&1

echo.
echo PalmExitGarage has been stopped.
echo MySQL service is still running (this is normal).
echo.
pause
