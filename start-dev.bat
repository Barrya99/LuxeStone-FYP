@echo off
setlocal enabledelayedexpansion

REM Jewelry Website - Development Environment Setup and Start Script

echo.
echo ==========================================
echo Jewelry Website - Development Setup
echo ==========================================
echo.

REM Get the root directory
set ROOT_DIR=%~dp0
echo Root Directory: %ROOT_DIR%
echo.

REM Check if Python is installed
echo Checking Python installation...
python --version
if errorlevel 1 (
    echo.
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    echo and ensure it's added to your PATH
    echo.
    pause
    exit /b 1
)
echo [OK] Python found
echo.

REM Check if Node.js/npm is installed
echo Checking Node.js/npm installation...
npm --version
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js/npm is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js found
echo.

REM Install backend dependencies
echo ==========================================
echo [1/5] Installing backend dependencies...
echo ==========================================
cd /d "%ROOT_DIR%diamond-backend"
if errorlevel 1 (
    echo [ERROR] Could not change to backend directory
    pause
    exit /b 1
)
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)
echo [SUCCESS] Backend dependencies installed
echo.
pause

REM Install frontend dependencies
echo ==========================================
echo [2/5] Installing frontend dependencies...
echo ==========================================
cd /d "%ROOT_DIR%diamond-frontend"
if errorlevel 1 (
    echo [ERROR] Could not change to frontend directory
    pause
    exit /b 1
)
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installed
echo.
pause

REM Start backend server
echo ==========================================
echo [3/5] Starting backend server...
echo ==========================================
cd /d "%ROOT_DIR%diamond-backend"
echo Starting Django development server...
start "Diamond Backend Server" cmd /k "python manage.py runserver"
if errorlevel 1 (
    echo [ERROR] Failed to start backend server
    pause
    exit /b 1
)
echo [SUCCESS] Backend started in new window
echo.
timeout /t 3 /nobreak
echo.

REM Start frontend server
echo ==========================================
echo [4/5] Starting frontend development server...
echo ==========================================
cd /d "%ROOT_DIR%diamond-frontend"
echo Starting Vite development server...
start "Diamond Frontend Server" cmd /k "npm run dev"
if errorlevel 1 (
    echo [ERROR] Failed to start frontend server
    pause
    exit /b 1
)
echo [SUCCESS] Frontend started in new window
echo.
timeout /t 5 /nobreak
echo.

REM Open in browser
echo ==========================================
echo [5/5] Opening website in browser...
echo ==========================================
start http://localhost:5173
echo.

REM Success message
echo.
echo ==========================================
echo ✓ Setup Complete!
echo ==========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
echo This window will close in 10 seconds...
echo.
timeout /t 10
exit /b 0
