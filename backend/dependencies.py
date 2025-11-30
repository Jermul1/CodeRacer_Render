"""
Shared dependencies for dependency injection across the application
"""
from sqlalchemy.orm import Session
from fastapi import Depends
from .database import get_db
from .services.auth_service import AuthService
from .services.game_service import GameService
from .services.snippet_service import SnippetService
from .services.user_service import UserService


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Get AuthService instance"""
    return AuthService(db)


def get_game_service(db: Session = Depends(get_db)) -> GameService:
    """Get GameService instance"""
    return GameService(db)


def get_snippet_service(db: Session = Depends(get_db)) -> SnippetService:
    """Get SnippetService instance"""
    return SnippetService(db)


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Get UserService instance"""
    return UserService(db)
