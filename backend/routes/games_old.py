from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
import random
import string
from datetime import datetime

from ..database import get_db
from ..models import Game, GameParticipant, User, Snippet

router = APIRouter(prefix="/games", tags=["games"])


def generate_room_code():
    """Generate a unique 6-character room code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class CreateGameRequest(BaseModel):
    user_id: int
    snippet_id: Optional[int] = None
    max_players: int = 4


class JoinGameRequest(BaseModel):
    user_id: int
    room_code: str


class GameResponse(BaseModel):
    id: int
    room_code: str
    host_user_id: int
    snippet_id: int
    status: str
    max_players: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ParticipantResponse(BaseModel):
    id: int
    user_id: int
    username: str
    progress: int
    wpm: float
    accuracy: float
    is_finished: bool
    finish_position: Optional[int]
    
    class Config:
        from_attributes = True


class GameDetailResponse(BaseModel):
    game: GameResponse
    participants: List[ParticipantResponse]
    snippet_code: str


@router.post("/create", response_model=GameResponse)
def create_game(payload: CreateGameRequest, db: Session = Depends(get_db)):
    """Create a new multiplayer game room"""
    # Verify user exists
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get a random snippet if none specified
    snippet_id = payload.snippet_id
    if not snippet_id:
        snippet = db.query(Snippet).order_by(func.random()).first()
        if not snippet:
            raise HTTPException(status_code=404, detail="No code snippets available")
        snippet_id = snippet.id
    
    # Generate unique room code
    room_code = generate_room_code()
    while db.query(Game).filter(Game.room_code == room_code).first():
        room_code = generate_room_code()
    
    # Create game
    game = Game(
        room_code=room_code,
        host_user_id=payload.user_id,
        snippet_id=snippet_id,
        status="waiting",
        max_players=payload.max_players
    )
    db.add(game)
    db.commit()
    db.refresh(game)
    
    # Add host as first participant
    participant = GameParticipant(
        game_id=game.id,
        user_id=user.id,
        username=user.username
    )
    db.add(participant)
    db.commit()
    
    return game


@router.post("/join")
def join_game(payload: JoinGameRequest, db: Session = Depends(get_db)):
    """Join an existing game room"""
    # Verify user exists
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find game
    game = db.query(Game).filter(Game.room_code == payload.room_code.upper()).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game room not found")
    
    if game.status != "waiting":
        raise HTTPException(status_code=400, detail="Game has already started")
    
    # Check if already in game
    existing = db.query(GameParticipant).filter(
        GameParticipant.game_id == game.id,
        GameParticipant.user_id == user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already in this game")
    
    # Check max players
    participant_count = db.query(GameParticipant).filter(GameParticipant.game_id == game.id).count()
    if participant_count >= game.max_players:
        raise HTTPException(status_code=400, detail="Game room is full")
    
    # Add participant
    participant = GameParticipant(
        game_id=game.id,
        user_id=user.id,
        username=user.username
    )
    db.add(participant)
    db.commit()
    
    return {"message": "Joined game successfully", "game_id": game.id}


@router.get("/{room_code}", response_model=GameDetailResponse)
def get_game(room_code: str, db: Session = Depends(get_db)):
    """Get game details and participants"""
    game = db.query(Game).filter(Game.room_code == room_code.upper()).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    participants = db.query(GameParticipant).filter(GameParticipant.game_id == game.id).all()
    snippet = db.query(Snippet).filter(Snippet.id == game.snippet_id).first()
    
    return {
        "game": game,
        "participants": participants,
        "snippet_code": snippet.code if snippet else ""
    }


@router.post("/{room_code}/start")
def start_game(room_code: str, user_id: int, db: Session = Depends(get_db)):
    """Start the game (only host can start)"""
    game = db.query(Game).filter(Game.room_code == room_code.upper()).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.host_user_id != user_id:
        raise HTTPException(status_code=403, detail="Only the host can start the game")
    
    if game.status != "waiting":
        raise HTTPException(status_code=400, detail="Game has already started")
    
    game.status = "in_progress"
    game.started_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Game started", "status": "in_progress"}


@router.delete("/{room_code}")
def delete_game(room_code: str, user_id: int, db: Session = Depends(get_db)):
    """Delete a game (only host can delete)"""
    game = db.query(Game).filter(Game.room_code == room_code.upper()).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.host_user_id != user_id:
        raise HTTPException(status_code=403, detail="Only the host can delete the game")
    
    # Delete participants first
    db.query(GameParticipant).filter(GameParticipant.game_id == game.id).delete()
    db.delete(game)
    db.commit()
    
    return {"message": "Game deleted successfully"}
