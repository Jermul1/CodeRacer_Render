"""
Authentication service for user registration and login
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models import User
from ..repositories.user_repository import UserRepository
from ..schemas.user import UserCreate, UserLogin
from ..core.security import hash_password, verify_password


class AuthService:
    """Service layer for authentication business logic"""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
    
    def signup(self, user_data: UserCreate) -> dict:
        """
        Register a new user
        
        Args:
            user_data: User registration data
            
        Returns:
            Success message with user ID
            
        Raises:
            HTTPException: If email or username already exists
        """
        # Check if user exists
        if self.user_repo.exists_by_email_or_username(user_data.email, user_data.username):
            existing = self.user_repo.get_by_email(user_data.email)
            if existing:
                raise HTTPException(status_code=400, detail="Email already registered")
            raise HTTPException(status_code=400, detail="Username already taken")
        
        # Create user
        hashed_pw = hash_password(user_data.password)
        user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_pw
        )
        created_user = self.user_repo.create(user)
        
        return {
            "message": "User created successfully",
            "id": created_user.id
        }
    
    def login(self, login_data: UserLogin) -> dict:
        """
        Authenticate a user
        
        Args:
            login_data: User login credentials
            
        Returns:
            Success message with user details
            
        Raises:
            HTTPException: If credentials are invalid
        """
        user = self.user_repo.get_by_email(login_data.email)
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return {
            "message": "Login successful",
            "user_id": user.id,
            "username": user.username
        }
