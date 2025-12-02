import socketio
import os
from datetime import datetime

from .database import SessionLocal
from .models import Game, GameParticipant
from .services.game_service import GameService
from .schemas.game import ParticipantProgress, ParticipantFinish


# Production CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins = [
    'http://localhost:5173',
    'https://coderacer-frontend.onrender.com',
    frontend_url
]

# Optional Redis message queue for horizontal scaling
redis_url = os.getenv("REDIS_URL")

# Create Socket.IO server (attach Redis if configured)
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=allowed_origins,
    message_queue=redis_url if redis_url else None
)

# Store active connections: room_code -> {sid -> user_id}
active_connections = {}


@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    """Handle client disconnection and cleanup state"""
    print(f"Client disconnected: {sid}")
    # Remove from active connections and update game state
    for room_code in list(active_connections.keys()):
        if sid in active_connections[room_code]:
            user_id = active_connections[room_code][sid]
            del active_connections[room_code][sid]
            # Use service to perform leave + host transfer if needed
            db = SessionLocal()
            try:
                svc = GameService(db)
                try:
                    result = svc.leave_game(room_code, user_id)
                except Exception as e:
                    # If service fails, emit minimal event and continue
                    await sio.emit('error', {'message': str(e)}, room=room_code)
                    continue
                if result.get('game_deleted'):
                    await sio.emit('game_deleted', {
                        'message': 'Game has been deleted'
                    }, room=room_code)
                else:
                    await sio.emit('player_left', {
                        'user_id': user_id,
                        'participants': result.get('remaining_participants', []),
                        'new_host_id': result.get('new_host_id'),
                        'new_host_username': result.get('new_host_username')
                    }, room=room_code)
            finally:
                db.close()


@sio.event
async def join_room(sid, data):
    """Player joins a game room"""
    room_code = data.get('room_code', '').upper()
    user_id = data.get('user_id')
    
    if not room_code or not user_id:
        await sio.emit('error', {'message': 'Missing room_code or user_id'}, to=sid)
        return
    
    # Join the Socket.IO room
    await sio.enter_room(sid, room_code)
    
    # Track connection
    if room_code not in active_connections:
        active_connections[room_code] = {}
    active_connections[room_code][sid] = user_id
    
    # Get game state
    db = SessionLocal()
    try:
        game = db.query(Game).filter(Game.room_code == room_code).first()
        if game:
            participants = db.query(GameParticipant).filter(GameParticipant.game_id == game.id).all()
            participant_data = [{
                'user_id': p.user_id,
                'username': p.username,
                'progress': p.progress,
                'wpm': float(p.wpm),
                'is_finished': p.is_finished
            } for p in participants]
            
            # Notify others that a player joined
            await sio.emit('player_joined', {
                'user_id': user_id,
                'participants': participant_data
            }, room=room_code)
    finally:
        db.close()


@sio.event
async def leave_room(sid, data):
    """Player leaves a game room"""
    room_code = data.get('room_code', '').upper()
    user_id = data.get('user_id')
    
    await sio.leave_room(sid, room_code)
    
    if room_code in active_connections and sid in active_connections[room_code]:
        user_id = active_connections[room_code][sid]
        del active_connections[room_code][sid]
    
    # Update game via service and broadcast detailed info
    db = SessionLocal()
    try:
        if user_id is None:
            # If user_id wasn't passed and not found, fall back to minimal event
            await sio.emit('player_left', {'sid': sid}, room=room_code)
            return
        svc = GameService(db)
        try:
            result = svc.leave_game(room_code, user_id)
        except Exception as e:
            await sio.emit('error', {'message': str(e)}, room=room_code)
            return
        if result.get('game_deleted'):
            await sio.emit('game_deleted', {
                'message': 'Game has been deleted'
            }, room=room_code)
        else:
            await sio.emit('player_left', {
                'user_id': user_id,
                'participants': result.get('remaining_participants', []),
                'new_host_id': result.get('new_host_id'),
                'new_host_username': result.get('new_host_username')
            }, room=room_code)
    finally:
        db.close()


@sio.event
async def start_game(sid, data):
    """Host starts the game"""
    room_code = data.get('room_code', '').upper()
    user_id = data.get('user_id')
    if not room_code or not user_id:
        await sio.emit('error', {'message': 'Missing room_code or user_id'}, to=sid)
        return
    db = SessionLocal()
    try:
        svc = GameService(db)
        game = svc.game_repo.get_by_room_code(room_code)
        if not game:
            await sio.emit('error', {'message': 'Game not found'}, to=sid)
            return
        if game.host_user_id != user_id:
            await sio.emit('error', {'message': 'Only host can start'}, to=sid)
            return
        if game.status != 'waiting':
            await sio.emit('error', {'message': 'Game already started or finished'}, to=sid)
            return
        game.status = 'in_progress'
        game.started_at = datetime.utcnow()
        svc.game_repo.update(game)
        await sio.emit('game_started', {
            'status': game.status,
            'started_at': game.started_at.isoformat()
        }, room=room_code)
    finally:
        db.close()


@sio.event
async def update_progress(sid, data):
    """Player updates their typing progress"""
    room_code = data.get('room_code', '').upper()
    user_id = data.get('user_id')
    progress = data.get('progress', 0)
    wpm = data.get('wpm', 0.0)
    accuracy = data.get('accuracy', 0.0)
    if not room_code or not user_id:
        await sio.emit('error', {'message': 'Missing room_code or user_id'}, to=sid)
        return
    db = SessionLocal()
    try:
        svc = GameService(db)
        try:
            svc.update_progress(ParticipantProgress(
                room_code=room_code,
                user_id=user_id,
                progress=progress,
                wpm=wpm,
                accuracy=accuracy
            ))
        except Exception as e:
            await sio.emit('error', {'message': str(e)}, to=sid)
            return
        # Fetch participant for broadcast (ensures clamped values)
        participant = svc.participant_repo.get_by_game_and_user(
            svc.game_repo.get_by_room_code(room_code).id, user_id
        )
        if participant:
            await sio.emit('progress_update', {
                'user_id': user_id,
                'username': participant.username,
                'progress': participant.progress,
                'wpm': float(participant.wpm),
                'accuracy': float(participant.accuracy)
            }, room=room_code)
    finally:
        db.close()


@sio.event
async def finish_race(sid, data):
    """Player finishes the race"""
    room_code = data.get('room_code', '').upper()
    user_id = data.get('user_id')
    wpm = data.get('wpm', 0.0)
    accuracy = data.get('accuracy', 0.0)
    if not room_code or not user_id:
        await sio.emit('error', {'message': 'Missing room_code or user_id'}, to=sid)
        return
    db = SessionLocal()
    try:
        svc = GameService(db)
        game = svc.game_repo.get_by_room_code(room_code)
        if not game:
            return
        try:
            resp = svc.finish_participant(ParticipantFinish(
                room_code=room_code,
                user_id=user_id,
                wpm=wpm,
                accuracy=accuracy
            ))
        except Exception as e:
            await sio.emit('error', {'message': str(e)}, to=sid)
            return
        participant = svc.participant_repo.get_by_game_and_user(game.id, user_id)
        if participant:
            await sio.emit('player_finished', {
                'user_id': user_id,
                'username': participant.username,
                'wpm': float(participant.wpm),
                'accuracy': float(participant.accuracy),
                'position': participant.finish_position
            }, room=room_code)
        # If game finished, broadcast ordered results
        game = svc.game_repo.get_by_room_code(room_code)
        if game.status == 'finished':
            all_participants = svc.participant_repo.get_by_game(game.id)
            ordered = sorted(
                [p for p in all_participants if p.finish_position is not None],
                key=lambda x: x.finish_position
            )
            results = [{
                'user_id': p.user_id,
                'username': p.username,
                'wpm': float(p.wpm),
                'accuracy': float(p.accuracy),
                'position': p.finish_position,
                'is_host': p.user_id == game.host_user_id
            } for p in ordered]
            await sio.emit('game_finished', {'results': results}, room=room_code)
    finally:
        db.close()


@sio.event
async def rematch_game(sid, data):
    """Host requests a rematch"""
    room_code = data.get('room_code', '').upper()
    user_id = data.get('user_id')
    
    if not room_code or not user_id:
        await sio.emit('error', {'message': 'Missing room_code or user_id'}, to=sid)
        return
    
    db = SessionLocal()
    try:
        svc = GameService(db)
        game = svc.game_repo.get_by_room_code(room_code)
        
        if not game:
            await sio.emit('error', {'message': 'Game not found'}, to=sid)
            return
        
        if game.host_user_id != user_id:
            await sio.emit('error', {'message': 'Only host can start rematch'}, to=sid)
            return
        
        if game.status != 'finished':
            await sio.emit('error', {'message': 'Can only rematch finished games'}, to=sid)
            return
        
        # Reset the game
        result = svc.reset_game_for_rematch(room_code, user_id)
        
        # Notify all players in the room
        await sio.emit('rematch_started', {
            'room_code': room_code,
            'message': 'Host started a rematch!'
        }, room=room_code)
        
    except Exception as e:
        await sio.emit('error', {'message': str(e)}, to=sid)
    finally:
        db.close()


# Create ASGI app
socket_app = socketio.ASGIApp(sio)
