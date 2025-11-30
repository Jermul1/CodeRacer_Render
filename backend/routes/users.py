"""
User account routes - edit and delete
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.user_service import UserService
from ..schemas.user import UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Dependency injection for UserService"""
    return UserService(db)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    user_service: UserService = Depends(get_user_service)
):
    """Update user profile fields (username, email, password)"""
    return user_service.update_user(user_id, payload)


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    """Delete a user account by id"""
    return user_service.delete_user(user_id)
