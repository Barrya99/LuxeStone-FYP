# Quick Start Guide

This project includes automated setup scripts to install dependencies and run both backend and frontend servers.

## Prerequisites

Before using these scripts, ensure you have:
- **Python 3.8+** installed and in your PATH
- **Node.js & npm** installed and in your PATH

## Option 1: Batch Script (Easiest - Windows)

1. Navigate to the project root directory
2. Double-click `start-dev.bat`

Or run from command prompt:
```cmd
start-dev.bat
```

## Option 2: PowerShell Script (Advanced - Windows)

1. Open PowerShell as Administrator
2. Run the following command:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
3. Navigate to the project root and run:
```powershell
.\start-dev.ps1
```

## What the Script Does

1. **Checks Prerequisites**: Verifies Python and Node.js are installed
2. **Installs Backend Dependencies**: Runs `pip install -r requirements.txt` in the `diamond-backend` folder
3. **Installs Frontend Dependencies**: Runs `npm install` in the `diamond-frontend` folder
4. **Starts Backend Server**: Opens a new window and runs `python manage.py runserver`
5. **Starts Frontend Server**: Opens a new window and runs `npm run dev`
6. **Opens Website**: Automatically opens http://localhost:5173 in your default browser

## Server URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

## Manual Steps (If scripts fail)

If you prefer to do it manually, open two terminal windows and run:

**Terminal 1 - Backend:**
```bash
cd diamond-backend
pip install -r requirements.txt
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd diamond-frontend
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Troubleshooting

- **Python not found**: Install Python from https://www.python.org/ and ensure it's added to PATH
- **npm not found**: Install Node.js from https://nodejs.org/
- **Port already in use**: Change the port in the server startup or kill the existing process
- **Permission denied (PS1)**: Run PowerShell as Administrator and execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
