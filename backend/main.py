import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import init_db
from .routes import auth as auth_router
from .routes import codesnippets as snippets_router
from .routes import games as games_router
from .routes import users as users_router
from .socketio_server import sio
import socketio


# --------------------------
# LIFESPAN
# --------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


# --------------------------
# CREATE FASTAPI FIRST
# --------------------------
app = FastAPI(lifespan=lifespan)


# --------------------------
# CORS CONFIGURATION
# --------------------------
env = os.getenv("ENV", "development")

# Get frontend URL from env, with common variations
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

if env == "production":
    allowed_origins = [
        frontend_url,
        # Add wildcard for Render preview/branch deploys if needed
        "https://coderacer-frontend.onrender.com",
        "https://coderacer-frontend-*.onrender.com",  # Covers any Render suffix
    ]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        frontend_url,
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# --------------------------
# HEALTH CHECK
# --------------------------
@app.get("/")
def root():
    return {"status": "healthy", "app": "CodeRacer API"}


# --------------------------
# INCLUDE ROUTERS
# --------------------------
app.include_router(auth_router.router)
app.include_router(snippets_router.router)
app.include_router(games_router.router)
app.include_router(users_router.router)


# --------------------------
# WRAP WITH SOCKET.IO
# --------------------------
# Wrap the entire FastAPI app with Socket.IO
# Socket.IO will handle its paths, FastAPI will handle the rest
app = socketio.ASGIApp(
    socketio_server=sio,
    other_asgi_app=app,
    socketio_path="/socket.io"
)
