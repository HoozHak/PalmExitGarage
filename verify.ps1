# PalmExitGarage System Verification Script
# This script checks if all services are running correctly

Write-Host "🔍 Verifying PalmExitGarage System Health..." -ForegroundColor Yellow

# Check Docker container
Write-Host "`n📊 Checking Database Container..." -ForegroundColor Green
$dbContainer = docker ps --filter "name=palmexitgarage-db" --format "table {{.Names}}\t{{.Status}}"
if ($dbContainer -match "palmexitgarage-db") {
    Write-Host "✅ Database container is running" -ForegroundColor Green
} else {
    Write-Host "❌ Database container is not running" -ForegroundColor Red
    Write-Host "💡 Run: docker-compose up -d" -ForegroundColor Yellow
}

# Check Docker volume
Write-Host "`n💾 Checking Data Volume..." -ForegroundColor Green
$volume = docker volume ls --filter "name=car-repair-app_db_data" --format "{{.Name}}"
if ($volume -eq "car-repair-app_db_data") {
    Write-Host "✅ Data volume exists" -ForegroundColor Green
} else {
    Write-Host "❌ Data volume missing" -ForegroundColor Red
}

# Check backend port
Write-Host "`n🚀 Checking Backend Server (Port 5000)..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/customers" -Method Get -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend server is responding" -ForegroundColor Green
        $customerCount = ($response.Content | ConvertFrom-Json).Length
        Write-Host "📋 Customer count: $customerCount" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Backend server is not responding" -ForegroundColor Red
    Write-Host "💡 Check if Node.js server is running: node index.js" -ForegroundColor Yellow
}

# Check frontend port
Write-Host "`n🌐 Checking Frontend Server (Port 5174)..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5174" -Method Get -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend server is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend server is not responding" -ForegroundColor Red
    Write-Host "💡 Check if Vite dev server is running: npm run dev" -ForegroundColor Yellow
}

# Check Node.js processes
Write-Host "`n🔄 Checking Node.js Processes..." -ForegroundColor Green
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "✅ Node.js processes running: $($nodeProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "❌ No Node.js processes found" -ForegroundColor Red
}

Write-Host "`n🏁 Verification Complete!" -ForegroundColor Yellow