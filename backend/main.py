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
# CORS MUST RUN BEFORE ANYTHING ELSE
# --------------------------
allowed_origins = [
    "https://coderacer-frontend.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
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
# MOUNT SOCKET.IO ASGI APP
# --------------------------
# Mount Socket.IO on /socket.io path instead of wrapping entire app
# This keeps FastAPI routes (including health check) accessible
sio_asgi_app = socketio.ASGIApp(socketio_server=sio)
app.mount("/socket.io", sio_asgi_app)
