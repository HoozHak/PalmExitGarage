# PalmExitGarage Startup Script
# This script starts the database, backend, and frontend services

Write-Host "🔧 Starting PalmExitGarage Services..." -ForegroundColor Yellow

# Start database using docker-compose
Write-Host "`n📊 Starting Database..." -ForegroundColor Green
docker-compose up -d

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Start backend server
Write-Host "`n🚀 Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\PalmExitGarage\server; Write-Host 'Backend Server Starting...' -ForegroundColor Green; node index.js"

# Wait a moment
Start-Sleep -Seconds 2

# Start frontend server
Write-Host "`n🌐 Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\PalmExitGarage\frontend; Write-Host 'Frontend Server Starting...' -ForegroundColor Blue; npm run dev"

Write-Host "`n✅ All services starting up!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5174" -ForegroundColor White
Write-Host "🔧 Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "🗃️ Database: MySQL on port 3308" -ForegroundColor White
Write-Host "`n⚡ Check the opened terminal windows for service logs" -ForegroundColor Yellow