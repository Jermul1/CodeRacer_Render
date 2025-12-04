from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os
import psycopg2
from psycopg2 import sql
from urllib.parse import urlparse

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
#print(DATABASE_URL)
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env")


def create_database_if_not_exists():
    """Check if database exists, create it if it doesn't."""
    parsed_url = urlparse(DATABASE_URL)
    username = parsed_url.username
    password = parsed_url.password
    host = parsed_url.hostname
    port = parsed_url.port or 5432
    database = parsed_url.path.lstrip('/')
    
    try:
        # Connect to default 'postgres' database to check/create target database
        conn = psycopg2.connect(
            dbname="postgres",
            user=username,
            password=password,
            host=host,
            port=port
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(
            sql.SQL("SELECT 1 FROM pg_database WHERE datname = %s"),
            [database]
        )
        
        if not cursor.fetchone():
            # Create the database if it doesn't exist
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(
                sql.Identifier(database)
            ))
            print(f"✅ Database '{database}' created successfully.")
        else:
            print(f"✅ Database '{database}' already exists.")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"⚠️  Could not create database: {e}")
        raise


# Create SQLAlchemy engine for PostgreSQL with connection health checks
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Database session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()

def init_db():
    """Creates database if it doesn't exist, then creates tables and seeds data."""
    create_database_if_not_exists()
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully.")
    
    # Import and run seed_data function
    try:
        from .seed_data import seed_data
    except ImportError:
        from seed_data import seed_data
    
    seed_data()

def get_db():
    """Yield a database session (dependency)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
