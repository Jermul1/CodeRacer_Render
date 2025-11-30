# Multiplayer Setup Guide

## Overview
Your CodeRacer game now supports multiplayer functionality! Players can create game rooms, invite friends via room codes, and race in real-time.

## Installation Steps

### 1. Install Backend Dependencies
```powershell
cd C:\CodeRacer_Prototype
.\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

### 2. Install Frontend Dependencies
```powershell
cd frontend
npm install
```

### 3. Update Database Schema
The new database models need to be created. Run:
```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run seed script to initialize database
python backend/seed_data.py
```

## Running the Application

### Start Backend (Terminal 1)
```powershell
cd C:\CodeRacer_Prototype
.\venv\Scripts\Activate.ps1
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend (Terminal 2)
```powershell
cd C:\CodeRacer_Prototype\frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Socket.IO**: ws://localhost:8000/socket.io

## How Multiplayer Works

### Game Flow
1. **Login/Signup**: Users must be logged in to create or join games
2. **Create Game**: Host creates a game room and gets a unique 6-character room code
3. **Join Game**: Other players enter the room code to join
4. **Lobby**: Players wait in lobby until host starts the game
5. **Race**: All players type the same code snippet simultaneously
6. **Live Updates**: Real-time progress bars show each player's position
7. **Results**: Final leaderboard shows winner and all player stats

### Features Implemented

#### Backend
- ✅ `Game` model - tracks game rooms
- ✅ `GameParticipant` model - tracks players in games
- ✅ REST API endpoints for game management
- ✅ WebSocket server for real-time updates
- ✅ Room code generation (6 characters)
- ✅ Progress tracking and WPM calculation
- ✅ Automatic game state management

#### Frontend
- ✅ `GameLobby` component - waiting room with player list
- ✅ `MultiplayerRace` component - live race with progress bars
- ✅ Room code sharing (click to copy)
- ✅ Real-time player updates via Socket.IO
- ✅ Results screen with leaderboard
- ✅ Login/signup integration
- ✅ Create/Join game flows

#### Socket.IO Events
**Client → Server:**
- `join_room` - Join a game room
- `leave_room` - Leave a game room
- `start_game` - Host starts the race
- `update_progress` - Player sends typing progress
- `finish_race` - Player completes the race

**Server → Client:**
- `player_joined` - New player joined
- `player_left` - Player left
- `game_started` - Race countdown begins
- `progress_update` - Player progress update
- `player_finished` - Player completed race
- `game_finished` - All players finished, show results

## API Endpoints

### Game Management
- `POST /games/create` - Create new game
  ```json
  {
    "user_id": 1,
    "snippet_id": null,  // Optional, random if null
    "max_players": 4
  }
  ```

- `POST /games/join` - Join existing game
  ```json
  {
    "user_id": 1,
    "room_code": "ABC123"
  }
  ```

- `GET /games/{room_code}` - Get game details

- `POST /games/{room_code}/start?user_id={id}` - Start game (host only)

- `DELETE /games/{room_code}?user_id={id}` - Delete game (host only)

## Testing Multiplayer

### Localhost Testing
1. Open browser at http://localhost:5173
2. Login/create account
3. Click "Create Multiplayer Race"
4. Copy the room code
5. Open a **new incognito/private window**
6. Go to http://localhost:5173
7. Login with different account
8. Click "Join Game" and enter room code
9. Host clicks "Start Game"
10. Both players race!

### Multiple Devices on Same Network
1. Find your local IP: `ipconfig` (look for IPv4)
2. Update frontend to use your IP instead of localhost
3. Other devices access: `http://{YOUR_IP}:5173`

## Troubleshooting

### Socket.IO Connection Issues
- Make sure backend is running on port 8000
- Check browser console for connection errors
- Verify CORS is configured correctly

### Database Errors
- Run migrations: `python backend/seed_data.py`
- Check PostgreSQL is running (if using postgres)
- Verify database connection in `.env`

### Players Not Syncing
- Check Socket.IO connection in browser dev tools
- Verify both players are in the same room_code
- Check backend logs for WebSocket events

## Next Steps / Future Enhancements
- [ ] Add chat in lobby
- [ ] Spectator mode
- [ ] Custom code snippets
- [ ] Tournament brackets
- [ ] Player stats/history
- [ ] Replay system
- [ ] Mobile responsive improvements

## Architecture Notes

### Real-time Communication
- Uses Socket.IO for bidirectional WebSocket communication
- Fallback to polling if WebSocket unavailable
- Room-based messaging (players only see their game's events)

### State Management
- Frontend: React useState hooks
- Backend: SQLAlchemy database + in-memory socket connections
- Optimistic UI updates for better UX

### Security Considerations
- User authentication required for game creation/joining
- Host-only game controls (start, delete)
- Room codes are unique and case-insensitive
- Input validation on all API endpoints
