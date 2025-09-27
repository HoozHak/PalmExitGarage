@echo off
echo Installing Docker Desktop...

:: Check if we have the Docker Desktop installer
if not exist "installers\Docker Desktop Installer.exe" (
    echo Docker Desktop installer not found. Downloading...
    mkdir installers 2>nul
    
    :: Download Docker Desktop
    echo Downloading Docker Desktop...
    echo This may take several minutes (approx 500MB)...
    powershell -Command "Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe' -OutFile 'installers\Docker Desktop Installer.exe'"
    
    if not exist "installers\Docker Desktop Installer.exe" (
        echo ERROR: Failed to download Docker Desktop installer
        echo.
        echo Please manually download Docker Desktop from:
        echo https://www.docker.com/products/docker-desktop/
        echo.
        echo Save it as: installers\Docker Desktop Installer.exe
        echo Then run this installer again.
        pause
        exit /b 1
    )
)

echo Installing Docker Desktop...
echo This will install Docker Desktop and may require a system restart.
echo.
pause

:: Install Docker Desktop
start /wait "installers\Docker Desktop Installer.exe" install --quiet

echo Docker Desktop installation completed.
echo.
echo IMPORTANT: 
echo 1. Docker Desktop may require a system restart
echo 2. After restart, Docker Desktop will start automatically
echo 3. You may need to accept license agreements in Docker Desktop
echo 4. Wait for Docker Desktop to fully start before continuing
echo.
echo Please restart your computer if prompted, then run the installer again.
echo.
pause
exit /b 0