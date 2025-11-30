"""
User repository for user-specific database operations
"""
from typing import Optional
from sqlalchemy.orm import Session
from ..models import User
from .base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User model with custom queries"""
    
    def __init__(self, db: Session):
        super().__init__(User, db)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()
    
    def exists_by_email_or_username(self, email: str, username: str) -> bool:
        """Check if user exists by email or username"""
        return self.db.query(User).filter(
            (User.email == email) | (User.username == username)
        ).first() is not None

    def email_taken_by_other(self, user_id: int, email: str) -> bool:
        """Check if email is used by another user"""
        existing = self.db.query(User).filter(User.email == email).first()
        return bool(existing and existing.id != user_id)

    def username_taken_by_other(self, user_id: int, username: str) -> bool:
        """Check if username is used by another user"""
        existing = self.db.query(User).filter(User.username == username).first()
        return bool(existing and existing.id != user_id)
