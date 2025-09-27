@echo off
echo Installing Node.js...

:: Check if we have the Node.js installer
if not exist "installers\node-v20.11.0-x64.msi" (
    echo Node.js installer not found. Downloading...
    mkdir installers 2>nul
    
    :: Download Node.js LTS
    echo Downloading Node.js v20.11.0 LTS...
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile 'installers\node-v20.11.0-x64.msi'"
    
    if not exist "installers\node-v20.11.0-x64.msi" (
        echo ERROR: Failed to download Node.js installer
        exit /b 1
    )
)

echo Installing Node.js v20.11.0...
start /wait msiexec /i "installers\node-v20.11.0-x64.msi" /quiet /norestart

:: Verify installation
echo Verifying Node.js installation...
:: Refresh PATH
call refreshenv.cmd 2>nul
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Please restart your command prompt and try again.
    echo Node.js has been installed but PATH needs to be refreshed.
    pause
    exit /b 1
)

echo Node.js installed successfully!
node --version
npm --version
exit /b 0