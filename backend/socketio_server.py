import socketio
from sqlalchemy.orm import Session
import os
from .database import SessionLocal
from .models import Game, GameParticipant
from datetime import datetime

# Production CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins = [
    'http://localhost:5173',
    'https://coderacer-frontend.onrender.com',
    frontend_url
]

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=allowed_origins
)

# Store active connections: room_code -> {sid -> user_id}
active_connections = {}


def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f"Client disconnected: {sid}")
    # Remove from active connections
    for room_code in list(active_connections.keys()):
        if sid in active_connections[room_code]:
            del active_connections[room_code][sid]
            await sio.emit('player_left', {'sid': sid}, room=room_code)


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
    
    await sio.leave_room(sid, room_code)
    
    if room_code in active_connections and sid in active_connections[room_code]:
        del active_connections[room_code][sid]
    
    await sio.emit('player_left', {'sid': sid}, room=room_code)


@sio.event
async def start_game(sid, data):
    """Host starts the game"""
    room_code = data.get('room_code', '').upper()
    user_id = data.get('user_id')
    
    db = SessionLocal()
    try:
        game = db.query(Game).filter(Game.room_code == room_code).first()
        if not game:
            await sio.emit('error', {'message': 'Game not found'}, to=sid)
            return
        
        if game.host_user_id != user_id:
            await sio.emit('error', {'message': 'Only host can start'}, to=sid)
            return
        
        game.status = "in_progress"
        game.started_at = datetime.utcnow()
        db.commit()
        
        # Notify all players
        await sio.emit('game_started', {
            'status': 'in_progress',
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
    
    db = SessionLocal()
    try:
        game = db.query(Game).filter(Game.room_code == room_code).first()
        if not game:
            return
        
        participant = db.query(GameParticipant).filter(
            GameParticipant.game_id == game.id,
            GameParticipant.user_id == user_id
        ).first()
        
        if participant:
            participant.progress = progress
            participant.wpm = wpm
            participant.accuracy = accuracy
            db.commit()
            
            # Broadcast progress to all players in room
            await sio.emit('progress_update', {
                'user_id': user_id,
                'username': participant.username,
                'progress': progress,
                'wpm': float(wpm),
                'accuracy': float(accuracy)
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
    
    db = SessionLocal()
    try:
        game = db.query(Game).filter(Game.room_code == room_code).first()
        if not game:
            return
        
        participant = db.query(GameParticipant).filter(
            GameParticipant.game_id == game.id,
            GameParticipant.user_id == user_id
        ).first()
        
        if participant and not participant.is_finished:
            participant.is_finished = True
            participant.wpm = wpm
            participant.accuracy = accuracy
            participant.finished_at = datetime.utcnow()
            
            # Calculate finish position
            finished_count = db.query(GameParticipant).filter(
                GameParticipant.game_id == game.id,
                GameParticipant.is_finished == True
            ).count()
            participant.finish_position = finished_count
            
            db.commit()
            
            # Notify all players
            await sio.emit('player_finished', {
                'user_id': user_id,
                'username': participant.username,
                'wpm': float(wpm),
                'accuracy': float(accuracy),
                'position': finished_count
            }, room=room_code)
            
            # Check if all players finished
            total_participants = db.query(GameParticipant).filter(
                GameParticipant.game_id == game.id
            ).count()
            
            if finished_count == total_participants:
                game.status = "finished"
                game.finished_at = datetime.utcnow()
                db.commit()
                
                # Get final results
                all_participants = db.query(GameParticipant).filter(
                    GameParticipant.game_id == game.id
                ).order_by(GameParticipant.finish_position).all()
                
                results = [{
                    'user_id': p.user_id,
                    'username': p.username,
                    'wpm': float(p.wpm),
                    'accuracy': float(p.accuracy),
                    'position': p.finish_position
                } for p in all_participants]
                
                await sio.emit('game_finished', {
                    'results': results
                }, room=room_code)
    finally:
        db.close()


# Create ASGI app
socket_app = socketio.ASGIApp(sio)
