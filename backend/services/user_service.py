"""
User service for account editing and deletion
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..repositories.user_repository import UserRepository
from ..schemas.user import UserUpdate, UserResponse
from ..core.security import hash_password


class UserService:
    """Service layer for user account management"""

    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def update_user(self, user_id: int, data: UserUpdate) -> UserResponse:
        """Update user profile fields with validation and hashing"""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Uniqueness checks
        if data.email and self.user_repo.email_taken_by_other(user_id, data.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        if data.username and self.user_repo.username_taken_by_other(user_id, data.username):
            raise HTTPException(status_code=400, detail="Username already taken")

        # Apply updates
        if data.username is not None:
            user.username = data.username
        if data.email is not None:
            user.email = data.email
        if data.password is not None:
            user.password_hash = hash_password(data.password)

        updated = self.user_repo.update(user)
        return UserResponse.model_validate(updated)

    def delete_user(self, user_id: int) -> dict:
        """Delete a user account by id"""
        deleted = self.user_repo.delete(user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User deleted successfully"}
