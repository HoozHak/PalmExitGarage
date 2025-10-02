# MySQL Community Server Download Script
# Downloads MySQL 8.0 installer for Windows

Write-Host "📥 MySQL Community Server Installer" -ForegroundColor Yellow
Write-Host "====================================`n"

$downloadUrl = "https://dev.mysql.com/get/Downloads/MySQLInstaller/mysql-installer-community-8.0.40.0.msi"
$outputPath = "$env:USERPROFILE\Downloads\mysql-installer-community.msi"

Write-Host "Downloading MySQL installer to: $outputPath" -ForegroundColor Cyan
Write-Host "This may take a few minutes...`n"

try {
    # Download the installer
    Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath -UseBasicParsing
    
    Write-Host "✅ Download complete!`n" -ForegroundColor Green
    Write-Host "📍 Installer location: $outputPath`n"
    
    Write-Host "🔧 INSTALLATION INSTRUCTIONS:" -ForegroundColor Yellow
    Write-Host "   1. Run the installer: $outputPath"
    Write-Host "   2. Choose 'Server only' installation"
    Write-Host "   3. Use these settings:"
    Write-Host "      - Port: 3306 (default)"
    Write-Host "      - Root password: example"
    Write-Host "      - Start MySQL as Windows Service: YES"
    Write-Host "   4. Complete the installation`n"
    
    $response = Read-Host "Would you like to open the installer now? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Start-Process $outputPath
        Write-Host "`n✅ Installer launched!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error downloading MySQL installer: $_" -ForegroundColor Red
    Write-Host "`nAlternatively, download manually from:" -ForegroundColor Yellow
    Write-Host "https://dev.mysql.com/downloads/installer/" -ForegroundColor Cyan
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
