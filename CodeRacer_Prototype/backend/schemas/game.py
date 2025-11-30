"""
Game schemas for request/response validation
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class GameCreate(BaseModel):
    """Schema for creating a new game"""
    user_id: int
    snippet_id: Optional[int] = None
    max_players: int = 4


class GameJoin(BaseModel):
    """Schema for joining a game"""
    user_id: int
    room_code: str


class GameUpdate(BaseModel):
    """Schema for updating game status"""
    status: str


class ParticipantProgress(BaseModel):
    """Schema for updating participant progress"""
    room_code: str
    user_id: int
    progress: int
    wpm: float
    accuracy: float


class ParticipantFinish(BaseModel):
    """Schema for marking participant as finished"""
    room_code: str
    user_id: int
    wpm: float
    accuracy: float


class ParticipantResponse(BaseModel):
    """Schema for participant response"""
    id: int
    user_id: int
    username: str
    progress: int
    wpm: float
    accuracy: float
    is_finished: bool
    finish_position: Optional[int]

    model_config = ConfigDict(from_attributes=True)


class GameResponse(BaseModel):
    """Schema for game response"""
    id: int
    room_code: str
    host_user_id: int
    snippet_id: int
    status: str
    max_players: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GameDetailResponse(BaseModel):
    """Schema for detailed game response with participants"""
    game: GameResponse
    participants: List[ParticipantResponse]
    snippet_code: str
