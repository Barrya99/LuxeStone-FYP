# Jewelry Website - Development Environment Setup and Start Script (PowerShell)
# Run this script from the project root directory

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Jewelry Website - Development Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Check if Python is installed
if (-not (Test-Command python)) {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
if (-not (Test-Command npm)) {
    Write-Host "[ERROR] Node.js/npm is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

$rootDir = $PSScriptRoot

Write-Host "[1/5] Installing backend dependencies..." -ForegroundColor Yellow
Push-Location "$rootDir\diamond-backend"
python -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install backend dependencies" -ForegroundColor Red
    Pop-Location
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[SUCCESS] Backend dependencies installed" -ForegroundColor Green
Pop-Location

Write-Host ""
Write-Host "[2/5] Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location "$rootDir\diamond-frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install frontend dependencies" -ForegroundColor Red
    Pop-Location
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[SUCCESS] Frontend dependencies installed" -ForegroundColor Green
Pop-Location

Write-Host ""
Write-Host "[3/5] Starting backend server..." -ForegroundColor Yellow
Push-Location "$rootDir\diamond-backend"
Start-Process -WindowStyle Normal -FilePath "cmd.exe" -ArgumentList "/k", "python manage.py runserver"
Write-Host "[SUCCESS] Backend started in new window" -ForegroundColor Green
Pop-Location

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[4/5] Starting frontend development server..." -ForegroundColor Yellow
Push-Location "$rootDir\diamond-frontend"
Start-Process -WindowStyle Normal -FilePath "cmd.exe" -ArgumentList "/k", "npm run dev"
Write-Host "[SUCCESS] Frontend started in new window" -ForegroundColor Green
Pop-Location

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "[5/5] Opening website in browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Both servers are running in separate windows." -ForegroundColor Yellow
Write-Host "Close the windows to stop the servers." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit this script"
