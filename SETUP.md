# Setup & Run Instructions

## First Time Setup

1. Open terminal/command prompt in the project root (where you see this file)

2. Install dependencies for all packages:
```bash
npm install-all
```

This will:
- Install `concurrently` (needed to run both servers)
- Install backend dependencies (pip install -r requirements.txt)
- Install frontend dependencies (npm install in diamond-frontend)

## Running the Project

After setup, simply run:
```bash
npm start
```

This will automatically start:
- **Backend**: Django server at http://localhost:8000
- **Frontend**: Vite dev server at http://localhost:5173

Both servers will run simultaneously in the same terminal.

## Other Commands

- **Backend only**: `npm run backend-only`
- **Frontend only**: `npm run frontend-only`
- **Both servers**: `npm start`

## Notes

- Make sure Python and Node.js are installed and in your PATH
- Press `Ctrl+C` in the terminal to stop both servers
- The browser will need to be opened manually to http://localhost:5173
