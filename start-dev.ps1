#!/usr/bin/env pwsh
# IOB Governance Platform - Development Startup Script

Write-Host "🚀 Starting IOB Governance Platform..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "📦 Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green

# Check if database container exists
Write-Host ""
Write-Host "🗄️  Checking database container..." -ForegroundColor Yellow
$containerExists = docker ps -a --filter "name=iob-db-v3" --format "{{.Names}}" 2>&1
if ($containerExists -eq "iob-db-v3") {
    $containerRunning = docker ps --filter "name=iob-db-v3" --format "{{.Names}}" 2>&1
    if ($containerRunning -eq "iob-db-v3") {
        Write-Host "✅ Database container is already running" -ForegroundColor Green
    } else {
        Write-Host "⚡ Starting database container..." -ForegroundColor Yellow
        docker start iob-db-v3
        Start-Sleep -Seconds 3
        Write-Host "✅ Database container started" -ForegroundColor Green
    }
} else {
    Write-Host "⚡ Creating new database container..." -ForegroundColor Yellow
    docker run --name iob-db-v3 `
        -e POSTGRES_USER=user `
        -e POSTGRES_PASSWORD=password `
        -e POSTGRES_DB=iob_governance `
        -p 5434:5432 `
        -d postgres:15
    Start-Sleep -Seconds 5
    Write-Host "✅ Database container created and started" -ForegroundColor Green
    
    # Run migrations
    Write-Host "⚡ Pushing database schema..." -ForegroundColor Yellow
    $env:DATABASE_URL = "postgresql://user:password@127.0.0.1:5434/iob_governance?schema=public"
    npx prisma db push
    Write-Host "✅ Schema pushed" -ForegroundColor Green
    
    # Seed data
    Write-Host "⚡ Seeding initial data..." -ForegroundColor Yellow
    npx ts-node prisma/seed.ts
    Write-Host "✅ Data seeded" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Starting services..." -ForegroundColor Cyan
Write-Host ""

# Start backend in new window
Write-Host "⚡ Starting NestJS Backend (port 3000)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run start:dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start frontend in new window
Write-Host "⚡ Starting React Frontend (port 5173)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm run dev -- --port 5173 --host"

Write-Host ""
Write-Host "✨ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend (UI):  http://localhost:5173" -ForegroundColor White
Write-Host "   Backend (API):  http://localhost:3000" -ForegroundColor White
Write-Host "   Database:       postgresql://127.0.0.1:5434/iob_governance" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Super User Login:" -ForegroundColor Cyan
Write-Host "   Email:    admin@iob.in" -ForegroundColor White
Write-Host "   Identity: EMP00000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
