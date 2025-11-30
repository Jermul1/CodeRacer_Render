# GitLab CI/CD Setup Guide

This document explains the CI/CD pipeline configuration for the CodeRacer project.

## Pipeline Overview

The pipeline consists of 3 stages:

1. **Test** - Run automated tests for backend and frontend
2. **Build** - Build Docker images
3. **Deploy** - Deploy to staging or production environments

## Pipeline Stages

### 1. Test Stage

#### Backend Testing (`test:backend`)
- Runs on: `main`, `develop`, and merge requests
- Uses Python 3.11 with PostgreSQL 15
- Executes pytest tests with coverage reporting
- Generates coverage reports in XML format
- **What it does:**
  - Installs Python dependencies
  - Waits for PostgreSQL to be ready
  - Runs all tests in `backend/tests/`
  - Generates code coverage reports

#### Frontend Testing (`test:frontend`)
- Runs on: `main`, `develop`, and merge requests
- Uses Node.js 20
- Runs ESLint to check code quality
- Caches `node_modules` for faster builds
- **What it does:**
  - Installs npm dependencies
  - Runs linting checks
  - (Add `npm run test` when you create frontend tests)

### 2. Build Stage

#### Backend Build (`build:backend`)
- Runs on: `main` and `develop` branches only
- Builds Docker image using `Dockerfile.backend`
- Tags images with commit SHA and `latest`
- Pushes to GitLab Container Registry
- **Requires:** Successful backend tests

#### Frontend Build (`build:frontend`)
- Runs on: `main` and `develop` branches only
- Builds Docker image using `Dockerfile.frontend`
- Tags images with commit SHA and `latest`
- Pushes to GitLab Container Registry
- **Requires:** Successful frontend tests

### 3. Deploy Stage

#### Staging Deployment (`deploy:staging`)
- Runs on: `develop` branch
- **Manual trigger required**
- Connects to staging server via SSH
- Pulls latest Docker images
- Restarts containers with `docker compose`
- **Environment:** staging

#### Production Deployment (`deploy:production`)
- Runs on: `main` branch only
- **Manual trigger required**
- Connects to production server via SSH
- Pulls latest Docker images
- Restarts containers with `docker compose`
- **Environment:** production

## Required GitLab CI/CD Variables

Configure these in GitLab: **Settings → CI/CD → Variables**

### For Docker Registry (automatically available in GitLab)
- `CI_REGISTRY` - GitLab Container Registry URL
- `CI_REGISTRY_USER` - GitLab registry username
- `CI_REGISTRY_PASSWORD` - GitLab registry password
- `CI_REGISTRY_IMAGE` - Full image path

### For Deployment (you need to add these)

#### Staging Variables
- `SSH_PRIVATE_KEY` - SSH private key for server access
- `STAGING_SERVER` - Staging server IP or domain
- `STAGING_USER` - SSH username for staging server

#### Production Variables
- `SSH_PRIVATE_KEY` - SSH private key for server access (can be same as staging)
- `PRODUCTION_SERVER` - Production server IP or domain
- `PRODUCTION_USER` - SSH username for production server

## Setup Instructions

### 1. Enable GitLab Container Registry

In your GitLab project:
1. Go to **Settings → General → Visibility**
2. Enable **Container Registry**

### 2. Add CI/CD Variables

1. Go to **Settings → CI/CD → Variables**
2. Click **Add variable** and add each required variable
3. Mark `SSH_PRIVATE_KEY` as **Protected** and **Masked**

### 3. Generate SSH Key for Deployment

On your local machine:
```powershell
ssh-keygen -t ed25519 -C "gitlab-ci" -f gitlab-ci-key
```

Add the public key to your servers:
```powershell
# Copy public key content
Get-Content gitlab-ci-key.pub

# SSH to your server and add to authorized_keys
ssh user@your-server
echo "paste-public-key-here" >> ~/.ssh/authorized_keys
```

Add the private key to GitLab CI/CD variables:
```powershell
Get-Content gitlab-ci-key
# Copy this content and add as SSH_PRIVATE_KEY variable
```

### 4. Update Server Paths in `.gitlab-ci.yml`

Edit the deployment jobs and replace `/path/to/app` with your actual application path on the server:
```yaml
script:
  - ssh $STAGING_USER@$STAGING_SERVER "cd /your/actual/path && docker compose pull && docker compose up -d"
```

### 5. Test the Pipeline

1. Commit and push changes to `develop` or `main` branch
2. Go to **CI/CD → Pipelines** in GitLab
3. Watch the pipeline execute
4. For deployment, click the manual play button

## Running Tests Locally

### Backend Tests
```powershell
cd backend
pip install pytest pytest-cov httpx
pytest tests/ --cov=. --cov-report=term-missing
```

### Frontend Linting
```powershell
cd frontend
npm install
npm run lint
```

## Pipeline Workflow

### Feature Development (feature branch → develop)
1. Create feature branch from `develop`
2. Make changes and commit
3. Create merge request to `develop`
4. Pipeline runs tests automatically
5. After merge, `develop` branch builds Docker images
6. Manually deploy to staging when ready

### Production Release (develop → main)
1. Create merge request from `develop` to `main`
2. Pipeline runs tests
3. After merge, `main` branch builds Docker images
4. Manually trigger production deployment

## Troubleshooting

### Pipeline Fails on Tests
- Check test logs in GitLab pipeline
- Run tests locally to debug
- Ensure database connection is working

### Build Fails
- Verify Dockerfiles are correct
- Check Docker registry permissions
- Ensure all files are committed

### Deployment Fails
- Verify SSH key is correct
- Check server is accessible
- Ensure Docker is installed on server
- Verify paths in deployment script

## Best Practices

1. **Always run tests locally** before pushing
2. **Use feature branches** for new development
3. **Review merge requests** before merging to `develop` or `main`
4. **Test on staging** before deploying to production
5. **Monitor pipeline** after each commit
6. **Keep secrets secure** - never commit sensitive data

## Adding More Tests

### Backend Tests
Create new test files in `backend/tests/`:
```python
# backend/tests/test_feature.py
def test_my_feature(client, db_session):
    response = client.get("/my-endpoint")
    assert response.status_code == 200
```

### Frontend Tests
Install testing library and create tests:
```powershell
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

Add test script to `package.json`:
```json
"scripts": {
  "test": "vitest"
}
```

Uncomment the test line in `.gitlab-ci.yml`:
```yaml
- npm run test
```

## Coverage Reports

View coverage reports in GitLab:
1. Go to **CI/CD → Pipelines**
2. Click on a completed pipeline
3. View coverage percentage
4. Download coverage artifacts for detailed reports
