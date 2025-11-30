# CodeRacer Setup Instructions

## Backend Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- PostgreSQL 14 or higher

### Database Setup

1. Install PostgreSQL from [official website](https://www.postgresql.org/download/)

2. Create a new PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE your_database_name;
```

### Environment Setup

1. Create a `.env` file in the project root:
```bash
# On Windows
copy .env.example .env
```

2. Update the `.env` file with your PostgreSQL credentials:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/your_database_name
```

### Initial Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# On Windows
venv\Scripts\activate
```

3. Navigate to the backend directory:
```bash
cd backend
```

4. Install required dependencies:
```bash
pip install -r requirements.txt
```

5. Initialize the database and seed initial data:
```bash
python seed_data.py
```

### Running the Backend Server

1. Start the FastAPI server:
```bash
uvicorn main:app --reload
# IF having trouble with imports try

cd ..
python -m uvicorn backend.main:app --reload
```

The backend server will be running at `http://localhost:8000`

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Available Endpoints
- Auth: `/auth/signup`, `/auth/login`
- Code Snippets: `/snippets/{language}`, `/snippets`

### Development Notes
- The server will automatically reload when you make changes to the code
- Make sure PostgreSQL service is running
- Keep requirements.txt updated when adding new dependencies
- Never commit `.env` file with sensitive data
- Use `.env.example` as a template for required environment variables

## Frontend Setup

### Prerequisites
- Node.js 18 or higher
- npm (comes with Node.js)

### Installation

1. **Install Node.js**
   - Download from [official website](https://nodejs.org/)
   - Verify installation:
   ```powershell
   node --version
   npm --version
   ```

2. **Navigate to frontend directory**:
```powershell
cd frontend
```

3. **Install dependencies**:
```powershell
npm install
```

### Running the Frontend

1. **Start the development server**:
```powershell
npm run dev
```

The frontend will be running at `http://localhost:5173`

2. **Build for production**:
```powershell
npm run build
```

3. **Preview production build**:
```powershell
npm run preview
```

### Development Notes
- Hot reload is enabled - changes will reflect automatically
- Make sure backend is running before testing API calls
- Built with React 19, Vite, and TailwindCSS
- Monaco Editor is used for code editing features

---

## Docker Setup (Recommended)

Docker provides an easier way to run the entire application with all dependencies.

### Prerequisites

1. **Install Docker Desktop for Windows**
   - Download from [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - Install and restart your computer if prompted
   - Verify installation:
   ```powershell
   docker --version
   docker compose version
   ```

### Docker Configuration

1. **Update `.env` file** in project root:
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coderacer
```
Note: Use `postgres` as hostname (Docker service name), not `localhost`

2. **Create required Docker files** (already included):
   - `Dockerfile.backend` - Backend container configuration
   - `Dockerfile.frontend` - Frontend container configuration  
   - `docker-compose.yml` - Multi-container orchestration
   - `.dockerignore` - Files to exclude from containers

### Running with Docker

1. **Build and start all services**:
```powershell
docker compose up --build
```

2. **Run in background (detached mode)**:
```powershell
docker compose up -d --build
```

3. **View logs**:
```powershell
docker compose logs -f

# Or for specific service
docker compose logs backend -f
docker compose logs frontend -f
```

4. **Stop services**:
```powershell
docker compose down
```

5. **Stop and remove volumes** (clears database):
```powershell
docker compose down -v
```

### Access Your Application with Docker

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

### Seed Database (Docker)

After containers are running:
```powershell
docker compose exec backend python -m backend.seed_data
```

### Docker Troubleshooting

**Backend keeps restarting?**
- Check logs: `docker compose logs backend`
- Ensure `.env` uses `postgres` hostname, not `localhost`
- Allow Docker through Windows Firewall when prompted

**Port already in use?**
```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :5173
```

**Reset everything**:
```powershell
docker compose down -v
docker compose up --build
```

---

