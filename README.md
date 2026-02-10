# Jewellery Website FYP

A full-stack web application for browsing, configuring, and purchasing diamond rings. Built with React + Vite for the frontend and Django for the backend.

**Status:** ✅ Fresh repository with clean commit history. Ready for development and deployment!

## Project Overview

This project is a comprehensive e-commerce platform for diamond jewelry with the following features:

- **Diamond Browsing**: Browse and filter diamonds by various attributes
- **Ring Configurator**: Interactive tool to customize diamond settings and ring sizes
- **Ring Configuration**: Save and manage favorite configurations
- **Shopping Cart**: Add items and manage orders
- **Comparison Tool**: Compare multiple diamonds side-by-side
- **AI Chatbot**: Get personalized jewelry recommendations

## Tech Stack

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (routing)
- Zustand (state management)
- Lucide React (icons)
- React Hot Toast (notifications)
- Axios (API client)

**Backend:**
- Django 5.x
- Django REST Framework
- Python 3.11+
- SQLite (development)

## Prerequisites

- **Node.js** 20.19+ or 22.12+ and npm (for frontend) - Vite requires Node 20.19+
- **Python** 3.11+ (for backend)
- **Git** (for version control)

**Check your versions:**
```bash
node --version
npm --version
python --version
```

## Project Structure

```
├── diamond-frontend/          # React + Vite frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # Zustand stores
│   │   ├── utils/             # Utilities and constants
│   │   └── App.jsx            # Main app component
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
│
└── diamond-backend/           # Django REST API
    ├── manage.py              # Django management script
    ├── requirements.txt       # Python dependencies
    ├── diamond_project/       # Main Django project
    └── rings/                 # Django app for rings
```

## Quick Start

The fastest way to get the app running:

### Terminal 1 - Backend
```bash
cd diamond-backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Terminal 2 - Frontend
```bash
cd diamond-frontend
npm install
npm run dev
```

Then open: **http://localhost:5173**

---

## Detailed Installation

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd diamond-backend
   ```

2. **Create a Python virtual environment:**
   ```bash
   python -m venv venv
   ```
   *(Note: venv is gitignored and will be created fresh on each clone)*

3. **Activate the virtual environment:**
   
   **Windows:**
   ```bash
   venv\Scripts\activate
   ```
   
   **macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Apply database migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser (optional, for admin panel):**
   ```bash
   python manage.py createsuperuser
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd diamond-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the `diamond-frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

## Running the Application

**Important:** You need to run both servers simultaneously in separate terminals.

### Terminal 1: Start Backend Server

1. **Navigate to backend directory:**
   ```bash
   cd diamond-backend
   ```

2. **Activate virtual environment (if not already activated):**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Run the Django development server:**
   ```bash
   python manage.py runserver
   ```

   The backend will be available at: `http://localhost:8000`
   - Admin Panel: `http://localhost:8000/admin`
   - API: `http://localhost:8000/api`

### Terminal 2: Start Frontend Server

In a **new terminal window**:

1. **Navigate to frontend directory:**
   ```bash
   cd diamond-frontend
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at: `http://localhost:5173`

3. **Open your browser and visit:**
   ```
   http://localhost:5173
   ```

You should now see the Jewellery Website app running! The frontend will automatically communicate with the backend API.

## Available Scripts

### Frontend Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Backend Commands

```bash
# Run development server
python manage.py runserver

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Access Django admin panel
# Go to http://localhost:8000/admin
```

## API Endpoints

### Diamonds
- `GET /api/diamonds/` - List all diamonds
- `GET /api/diamonds/{id}/` - Get diamond details
- `GET /api/diamonds/?filters` - Filter diamonds

### Settings
- `GET /api/settings/` - List all ring settings
- `GET /api/settings/{id}/` - Get setting details
- `GET /api/settings/?filters` - Filter settings

### Cart & Orders
- `POST /api/orders/` - Create an order
- `GET /api/orders/` - Get user orders

## Environment Variables

### Frontend (.env)

Create a `.env` file in the `diamond-frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend (.env)

Create a `.env` file in the `diamond-backend` directory (optional, for production):

```env
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

**Note:** The backend works without a .env file in development mode with default settings.

## Deployment

### Frontend Deployment (Vercel)

The project includes a `vercel.json` configuration for easy deployment:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd diamond-frontend
   vercel
   ```

### Backend Deployment

Deploy your Django backend to a service like:
- Heroku
- AWS
- DigitalOcean
- Railway
- PythonAnywhere

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the `ALLOWED_HOSTS` in Django settings includes your frontend URL.

### Port Already in Use
If port 8000 or 5173 is already in use, specify a different port:

```bash
# Django on port 8001
python manage.py runserver 8001

# Frontend on port 3000
npm run dev -- --port 3000
```

### Virtual Environment Issues
If you encounter issues with the virtual environment, delete it and recreate:

```bash
rm -rf venv  # or rmdir /s venv on Windows
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```
