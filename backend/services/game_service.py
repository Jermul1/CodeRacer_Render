"""
Game service for game and participant management
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models import Game, GameParticipant
from ..repositories.game_repository import GameRepository, ParticipantRepository
from ..repositories.user_repository import UserRepository
from ..repositories.snippet_repository import SnippetRepository
from ..schemas.game import (
    GameCreate, GameJoin, GameResponse, GameDetailResponse,
    ParticipantResponse, ParticipantProgress, ParticipantFinish
)
import random
import string


class GameService:
    """Service layer for game business logic"""
    
    def __init__(self, db: Session):
        self.db = db
        self.game_repo = GameRepository(db)
        self.participant_repo = ParticipantRepository(db)
        self.user_repo = UserRepository(db)
        self.snippet_repo = SnippetRepository(db)
    
    def _generate_unique_room_code(self) -> str:
        """Generate a unique 6-character room code"""
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not self.game_repo.room_code_exists(code):
                return code
    
    def create_game(self, game_data: GameCreate) -> GameResponse:
        """
        Create a new game room
        
        Args:
            game_data: Game creation data
            
        Returns:
            Created game details
            
        Raises:
            HTTPException: If user not found or no snippets available
        """
        # Verify user exists
        user = self.user_repo.get_by_id(game_data.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Determine snippet (explicit snippet_id overrides language)
        snippet_id = game_data.snippet_id
        snippet = None
        if snippet_id:
            snippet = self.snippet_repo.get_by_id(snippet_id)
            if not snippet:
                raise HTTPException(status_code=404, detail="Snippet not found")
        else:
            # If language provided choose random snippet from that language
            if game_data.language:
                snippet = self.snippet_repo.get_random_by_language(game_data.language)
                if not snippet:
                    raise HTTPException(status_code=404, detail="No snippets available for selected language")
            else:
                snippet = self.snippet_repo.get_random()
                if not snippet:
                    raise HTTPException(status_code=404, detail="No code snippets available")
            snippet_id = snippet.id
        
        # Create game
        room_code = self._generate_unique_room_code()
        game = Game(
            room_code=room_code,
            host_user_id=game_data.user_id,
            snippet_id=snippet_id,
            status="waiting",
            max_players=game_data.max_players
        )
        created_game = self.game_repo.create(game)
        
        # Add host as participant
        participant = GameParticipant(
            game_id=created_game.id,
            user_id=user.id,
            username=user.username
        )
        self.participant_repo.create(participant)
        
        return GameResponse.model_validate(created_game)
    
    def join_game(self, join_data: GameJoin) -> dict:
        """
        Join an existing game room
        
        Args:
            join_data: Game join data
            
        Returns:
            Success message with game ID
            
        Raises:
            HTTPException: If validation fails
        """
        # Verify user
        user = self.user_repo.get_by_id(join_data.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Find game
        game = self.game_repo.get_by_room_code(join_data.room_code)
        if not game:
            raise HTTPException(status_code=404, detail="Game room not found")
        
        # Validate game state
        if game.status != "waiting":
            raise HTTPException(status_code=400, detail="Game has already started")
        
        # Check if already joined
        if self.participant_repo.get_by_game_and_user(game.id, user.id):
            raise HTTPException(status_code=400, detail="Already in this game")
        
        # Check capacity
        if self.participant_repo.count_by_game(game.id) >= game.max_players:
            raise HTTPException(status_code=400, detail="Game room is full")
        
        # Add participant
        participant = GameParticipant(
            game_id=game.id,
            user_id=user.id,
            username=user.username
        )
        self.participant_repo.create(participant)
        
        return {"message": "Joined game successfully", "game_id": game.id}
    
    def get_game_details(self, room_code: str) -> GameDetailResponse:
        """
        Get detailed game information
        
        Args:
            room_code: Game room code
            
        Returns:
            Game details with participants and code snippet
            
        Raises:
            HTTPException: If game not found
        """
        game = self.game_repo.get_by_room_code(room_code)
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
        
        participants = self.participant_repo.get_by_game(game.id)
        snippet = self.snippet_repo.get_by_id(game.snippet_id)
        
        language_name = "" if not snippet or not snippet.language else snippet.language.name
        return GameDetailResponse(
            game=GameResponse.model_validate(game),
            participants=[ParticipantResponse.model_validate(p) for p in participants],
            snippet_code=snippet.code if snippet else "",
            snippet_language=language_name
        )
    
    def start_game(self, room_code: str) -> dict:
        """
        Start a game
        
        Args:
            room_code: Game room code
            
        Returns:
            Success message
            
        Raises:
            HTTPException: If game not found or already started
        """
        game = self.game_repo.get_by_room_code(room_code)
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
        
        if game.status != "waiting":
            raise HTTPException(status_code=400, detail="Game already started or finished")
        
        game.status = "in_progress"
        self.game_repo.update(game)
        
        return {"message": "Game started successfully"}
    
    def update_progress(self, progress_data: ParticipantProgress) -> dict:
        """
        Update participant progress
        
        Args:
            progress_data: Participant progress data
            
        Returns:
            Success message
            
        Raises:
            HTTPException: If game or participant not found
        """
        game = self.game_repo.get_by_room_code(progress_data.room_code)
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
        
        participant = self.participant_repo.get_by_game_and_user(
            game.id, progress_data.user_id
        )
        if not participant:
            raise HTTPException(status_code=404, detail="Participant not found")
        
        # Retrieve snippet length for validation/clamping
        snippet = self.snippet_repo.get_by_id(game.snippet_id)
        snippet_len = len(snippet.code) if snippet and snippet.code else 0

        # Clamp progress to valid bounds (characters typed)
        raw_progress = progress_data.progress
        if raw_progress < 0:
            raw_progress = 0
        if snippet_len and raw_progress > snippet_len:
            raw_progress = snippet_len

        # Clamp WPM & accuracy to sensible anti-cheat bounds
        raw_wpm = progress_data.wpm
        if raw_wpm < 0:
            raw_wpm = 0
        if raw_wpm > 400:  # Arbitrary high cap
            raw_wpm = 400

        raw_accuracy = progress_data.accuracy
        if raw_accuracy < 0:
            raw_accuracy = 0
        if raw_accuracy > 100:
            raw_accuracy = 100

        participant.progress = raw_progress
        participant.wpm = raw_wpm
        participant.accuracy = raw_accuracy
        self.participant_repo.update(participant)
        
        return {"message": "Progress updated"}
    
    def finish_participant(self, finish_data: ParticipantFinish) -> dict:
        """
        Mark participant as finished
        
        Args:
            finish_data: Participant finish data
            
        Returns:
            Success message with finish position
            
        Raises:
            HTTPException: If game or participant not found
        """
        game = self.game_repo.get_by_room_code(finish_data.room_code)
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
        
        participant = self.participant_repo.get_by_game_and_user(
            game.id, finish_data.user_id
        )
        if not participant:
            raise HTTPException(status_code=404, detail="Participant not found")
        
        if participant.is_finished:
            raise HTTPException(status_code=400, detail="Already finished")
        
        # Retrieve snippet length for accurate final progress
        snippet = self.snippet_repo.get_by_id(game.snippet_id)
        snippet_len = len(snippet.code) if snippet and snippet.code else 0

        # Set finish data
        participant.is_finished = True
        participant.wpm = finish_data.wpm
        participant.accuracy = finish_data.accuracy
        # Progress represents characters typed; set to full snippet length if known
        participant.progress = snippet_len if snippet_len else participant.progress
        participant.finish_position = self.participant_repo.get_next_finish_position(game.id)
        self.participant_repo.update(participant)
        
        # Check if all players finished
        total_participants = self.participant_repo.count_by_game(game.id)
        finished_participants = self.participant_repo.count_finished_by_game(game.id)
        
        if total_participants == finished_participants:
            game.status = "finished"
            self.game_repo.update(game)
        
        return {
            "message": "Participant marked as finished",
            "finish_position": participant.finish_position
        }
