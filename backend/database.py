from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
#print(DATABASE_URL)
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env")


# Create SQLAlchemy engine for PostgreSQL with connection health checks
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Database session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()

def init_db():
    """Creates tables if they don't exist yet."""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully.")

def get_db():
    """Yield a database session (dependency)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
