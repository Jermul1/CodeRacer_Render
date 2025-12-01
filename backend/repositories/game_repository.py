"""
Game and participant repositories for game-related database operations
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from ..models import Game, GameParticipant
from .base import BaseRepository


class GameRepository(BaseRepository[Game]):
    """Repository for Game model with custom queries"""
    
    def __init__(self, db: Session):
        super().__init__(Game, db)
    
    def get_by_room_code(self, room_code: str) -> Optional[Game]:
        """Get game by room code (case-insensitive)"""
        return self.db.query(Game).filter(
            Game.room_code == room_code.upper()
        ).first()
    
    def room_code_exists(self, room_code: str) -> bool:
        """Check if room code already exists"""
        return self.get_by_room_code(room_code) is not None
    
    def get_active_games(self) -> List[Game]:
        """Get all games that are waiting or in progress"""
        return self.db.query(Game).filter(
            Game.status.in_(["waiting", "in_progress"])
        ).all()
    
    def get_by_host(self, host_user_id: int) -> List[Game]:
        """Get all games hosted by a specific user"""
        return self.db.query(Game).filter(
            Game.host_user_id == host_user_id
        ).all()


class ParticipantRepository(BaseRepository[GameParticipant]):
    """Repository for GameParticipant model with custom queries"""
    
    def __init__(self, db: Session):
        super().__init__(GameParticipant, db)
    
    def get_by_game_and_user(self, game_id: int, user_id: int) -> Optional[GameParticipant]:
        """Get participant by game and user ID"""
        return self.db.query(GameParticipant).filter(
            GameParticipant.game_id == game_id,
            GameParticipant.user_id == user_id
        ).first()
    
    def get_by_game(self, game_id: int) -> List[GameParticipant]:
        """Get all participants for a specific game"""
        return self.db.query(GameParticipant).filter(
            GameParticipant.game_id == game_id
        ).all()
    
    def count_by_game(self, game_id: int) -> int:
        """Count participants in a game"""
        return self.db.query(GameParticipant).filter(
            GameParticipant.game_id == game_id
        ).count()
    
    def count_finished_by_game(self, game_id: int) -> int:
        """Count finished participants in a game"""
        return self.db.query(GameParticipant).filter(
            GameParticipant.game_id == game_id,
            GameParticipant.is_finished == True
        ).count()
    
    def get_next_finish_position(self, game_id: int) -> int:
        """Get the next finish position for a game"""
        # Lock existing finished rows to avoid race conditions assigning duplicate positions
        query = self.db.query(GameParticipant.finish_position).filter(
            GameParticipant.game_id == game_id,
            GameParticipant.finish_position.isnot(None)
        ).order_by(GameParticipant.finish_position.desc()).with_for_update()
        max_position = query.first()
        return (max_position[0] + 1) if max_position and max_position[0] else 1
