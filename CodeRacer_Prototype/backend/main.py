from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
from .database import Base, get_db, init_db
from . import models as models
from .routes import auth as auth_router
from .routes import codesnippets as snippets_router
from .routes import games as games_router
from .routes import users as users_router
from .socketio_server import socket_app, sio
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown (if needed)

app = FastAPI(lifespan=lifespan)

# Production CORS - allow your frontend domain
origins = [
    "http://localhost:5173",
    "https://coderacer-frontend.onrender.com",  # Your Render frontend URL
    os.getenv("FRONTEND_URL", "http://localhost:5173")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint for Render
@app.get("/")
def read_root():
    return {"status": "healthy", "app": "CodeRacer API"}

# include auth routes
app.include_router(auth_router.router)
app.include_router(snippets_router.router)
app.include_router(games_router.router)
app.include_router(users_router.router)

# Mount Socket.IO
app.mount("/socket.io", socket_app)