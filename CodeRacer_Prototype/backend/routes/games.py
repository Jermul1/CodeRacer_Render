"""
Game routes - thin controllers using GameService
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.game_service import GameService
from ..schemas.game import (
    GameCreate, GameJoin, GameResponse, GameDetailResponse,
    ParticipantProgress, ParticipantFinish
)

router = APIRouter(prefix="/games", tags=["games"])


def get_game_service(db: Session = Depends(get_db)) -> GameService:
    """Dependency injection for GameService"""
    return GameService(db)


@router.post("/create", response_model=GameResponse)
def create_game(
    payload: GameCreate,
    game_service: GameService = Depends(get_game_service)
):
    """Create a new multiplayer game room"""
    return game_service.create_game(payload)


@router.post("/join")
def join_game(
    payload: GameJoin,
    game_service: GameService = Depends(get_game_service)
):
    """Join an existing game room"""
    return game_service.join_game(payload)


@router.get("/{room_code}", response_model=GameDetailResponse)
def get_game(
    room_code: str,
    game_service: GameService = Depends(get_game_service)
):
    """Get game details and participants"""
    return game_service.get_game_details(room_code)


@router.post("/{room_code}/start")
def start_game(
    room_code: str,
    game_service: GameService = Depends(get_game_service)
):
    """Start the game"""
    return game_service.start_game(room_code)


@router.post("/progress")
def update_progress(
    payload: ParticipantProgress,
    game_service: GameService = Depends(get_game_service)
):
    """Update participant progress during the race"""
    return game_service.update_progress(payload)


@router.post("/finish")
def finish_participant(
    payload: ParticipantFinish,
    game_service: GameService = Depends(get_game_service)
):
    """Mark participant as finished"""
    return game_service.finish_participant(payload)
