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

# --------------------------
# CORS configuration
# --------------------------
# We support multiple mechanisms:
# 1. Hard-coded sensible defaults for local dev
# 2. Single FRONTEND_URL (legacy)
# 3. Comma‑separated FRONTEND_ORIGINS for multiple domains
#    e.g. FRONTEND_ORIGINS="https://prod-frontend.onrender.com,https://staging-frontend.onrender.com"

default_local_origins = [
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # Common React port
    "http://127.0.0.1:3000",
]

legacy_frontend = os.getenv("FRONTEND_URL", "").strip()
multi_frontends_env = os.getenv("FRONTEND_ORIGINS", "")
multi_frontends = [o.strip() for o in multi_frontends_env.split(",") if o.strip()]

# Known Render frontend (adjust if renamed)
known_render_frontend = "https://coderacer-frontend.onrender.com"

origins = []
origins.extend(default_local_origins)
origins.append(known_render_frontend)
if legacy_frontend:
    origins.append(legacy_frontend)
origins.extend(multi_frontends)

# Deduplicate while preserving order
seen = set()
deduped_origins = []
for o in origins:
    if o and o not in seen:
        deduped_origins.append(o)
        seen.add(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=deduped_origins,
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