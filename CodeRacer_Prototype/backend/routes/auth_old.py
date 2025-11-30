from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from pydantic import BaseModel
from ..database import get_db
from ..models import User



router = APIRouter(prefix="/auth", tags=["auth"])

#
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# ✅ Define a Pydantic model for signup input
class SignupRequest(BaseModel):
    username: str
    email: str
    password: str


@router.post("/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == payload.email) | (User.username == payload.username)
    ).first()
    
    if existing_user:
        if existing_user.email == payload.email:
            raise HTTPException(status_code=400, detail="Email already registered")
        if existing_user.username == payload.username:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    try:
        hashed_pw = pwd_context.hash(payload.password)
        user = User(username=payload.username, email=payload.email, password_hash=hashed_pw)
        db.add(user)
        db.commit()
        db.refresh(user)
        return {"message": "User created successfully", "id": user.id}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="User already exists")

@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user_id": user.id}

