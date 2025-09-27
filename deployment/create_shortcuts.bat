@echo off
echo Creating shortcuts...

set INSTALL_DIR=%~dp0
set DESKTOP=%USERPROFILE%\Desktop
set STARTMENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs

:: Create desktop shortcut for starting PalmExitGarage
echo Creating desktop shortcut...
powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\Start PalmExitGarage.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%START_PALMEXITGARAGE.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%assets\palmexitgarage.ico'; $Shortcut.Description = 'Start PalmExitGarage Auto Repair System'; $Shortcut.Save()"

:: Create start menu folder and shortcuts
echo Creating start menu shortcuts...
mkdir "%STARTMENU%\PalmExitGarage" 2>nul

powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTMENU%\PalmExitGarage\Start PalmExitGarage.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%START_PALMEXITGARAGE.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%assets\palmexitgarage.ico'; $Shortcut.Description = 'Start PalmExitGarage Auto Repair System'; $Shortcut.Save()"

powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTMENU%\PalmExitGarage\Stop PalmExitGarage.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%STOP_PALMEXITGARAGE.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'Stop PalmExitGarage Auto Repair System'; $Shortcut.Save()"

powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTMENU%\PalmExitGarage\Open PalmExitGarage.lnk'); $Shortcut.TargetPath = 'http://localhost:3000'; $Shortcut.Description = 'Open PalmExitGarage in Browser'; $Shortcut.Save()"

echo Shortcuts created successfully!
exit /b 0