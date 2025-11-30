"""
User schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    """Schema for user registration"""
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile information"""
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None


class UserResponse(BaseModel):
    """Schema for user response"""
    id: int
    username: str
    email: str

    # Pydantic v2 style config
    model_config = ConfigDict(from_attributes=True)
