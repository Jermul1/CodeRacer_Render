"""
Authentication routes - thin controllers using AuthService
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.auth_service import AuthService
from ..schemas.user import UserCreate, UserLogin

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Dependency injection for AuthService"""
    return AuthService(db)


@router.post("/signup")
def signup(
    payload: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Register a new user"""
    return auth_service.signup(payload)


@router.post("/login")
def login(
    payload: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Authenticate a user"""
    return auth_service.login(payload)
