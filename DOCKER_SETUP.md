# Docker Setup Guide

This guide explains how to use Docker to test and deploy the CodeRacer project.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0 or higher
- Git

## Quick Start

### 1. Clone and Setup Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd Render

# Copy environment template
cp .env.example .env

# Edit .env with your configuration (optional for local development)
```

### 2. Run Development Environment

```bash
# Start all services (backend, frontend, database, redis)
docker-compose up

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### 3. Run Production Environment

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up --build

# Or use the production target
docker-compose -f docker-compose.prod.yml up -d
```

## Docker Commands Reference

### Basic Operations

```bash
# Build images
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Start services
docker-compose up

# Stop services (keeps containers)
docker-compose stop

# Remove containers, networks, volumes
docker-compose down -v

# View running containers
docker-compose ps

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
```

### Development Workflows

```bash
# Run backend tests
docker-compose exec backend pytest tests/ -v

# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec db psql -U postgres -d coderacer

# Install new Python package
docker-compose exec backend pip install <package>
# Then add to requirements.txt and rebuild

# Install new npm package
docker-compose exec frontend npm install <package>
```

### Database Operations

```bash
# Seed database (first time setup)
docker-compose exec backend python -m backend.seed_data

# Or use the convenience script:
# Linux/Mac:
chmod +x scripts/seed-database.sh
./scripts/seed-database.sh

# Windows:
scripts\seed-database.bat

# Run database migrations (if applicable)
docker-compose exec backend python -m alembic upgrade head

# Backup database
docker-compose exec db pg_dump -U postgres coderacer > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres coderacer < backup.sql
```

## CI/CD Integration

### GitHub Actions

Two workflows are included:

#### 1. CI Pipeline (`.github/workflows/ci.yml`)

Triggered on push/PR to main/develop:
- Runs backend tests with PostgreSQL and Redis
- Runs frontend tests and linting
- Builds Docker images
- Pushes to GitHub Container Registry (main branch only)
- Security scanning with Trivy

#### 2. Deploy Pipeline (`.github/workflows/deploy.yml`)

Manual deployment or triggered by version tags:
- Deploys to Render.com
- Supports production/staging environments

### Required GitHub Secrets

Add these secrets in your GitHub repository settings:

```
CODECOV_TOKEN              # Optional: For code coverage reports
RENDER_API_KEY            # For Render deployments
RENDER_SERVICE_ID_BACKEND # Backend service ID from Render
RENDER_SERVICE_ID_FRONTEND # Frontend service ID from Render
```

### Docker Registry Authentication

For GitHub Container Registry:

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull images
docker pull ghcr.io/<username>/coderacer/backend:latest
docker pull ghcr.io/<username>/coderacer/frontend:latest
```

## Architecture

### Multi-Stage Builds

Both Dockerfiles use multi-stage builds for efficiency:

**Backend (Python)**
- `base`: Common dependencies
- `development`: Hot-reload with uvicorn
- `production`: Gunicorn with multiple workers

**Frontend (React)**
- `base`: Node.js setup
- `development`: Vite dev server
- `build`: Build static assets
- `production`: Nginx serving optimized bundle

### Services

1. **Database (PostgreSQL 15)**
   - Port: 5432
   - Data persisted in named volume
   - Auto-initialized with db_example.sql

2. **Redis**
   - Port: 6379
   - Used for sessions and caching
   - Data persisted in named volume

3. **Backend (FastAPI)**
   - Port: 8000
   - WebSocket support for multiplayer
   - Health checks enabled

4. **Frontend (React + Vite)**
   - Dev Port: 5173
   - Prod Port: 80 (Nginx)
   - Nginx configuration for SPA routing

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change ports in docker-compose.yml or stop conflicting services
docker-compose down
# Edit ports in docker-compose.yml, then:
docker-compose up
```

**Database connection errors:**
```bash
# Wait for database to be ready
docker-compose logs db

# Check health status
docker-compose ps
```

**Volume permissions (Linux):**
```bash
# If you get permission errors
sudo chown -R $USER:$USER .
```

**Clean rebuild:**
```bash
# Remove everything and start fresh
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Performance Optimization

**For faster rebuilds:**
- Use BuildKit: `DOCKER_BUILDKIT=1 docker-compose build`
- Use layer caching in CI/CD
- Minimize layers in Dockerfile

**Production tuning:**
- Adjust Gunicorn workers: `--workers 4`
- Configure PostgreSQL connection pooling
- Enable Redis persistence if needed

## Production Deployment

### Environment Variables

Set these in production:

```env
ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=<strong-random-key>
FRONTEND_URL=https://your-domain.com
REDIS_URL=redis://redis:6379
```

### Security Checklist

- [ ] Use strong SECRET_KEY
- [ ] Set proper CORS origins
- [ ] Use non-root users in containers
- [ ] Enable HTTPS (use reverse proxy like Traefik/Nginx)
- [ ] Regularly update base images
- [ ] Scan for vulnerabilities (Trivy, Snyk)
- [ ] Use secrets management (not .env in production)
- [ ] Enable container resource limits

### Monitoring

```yaml
# Add to docker-compose.prod.yml for resource limits
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
