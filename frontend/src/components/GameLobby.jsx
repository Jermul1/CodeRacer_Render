import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { getGame, startGame } from "../api";
import "../styles/GameLobby.css";

export default function GameLobby({ roomCode, userId, onStartRace, onBack }) {
  const [gameData, setGameData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [languageName, setLanguageName] = useState("");

  useEffect(() => {
    // Fetch initial game data
    const fetchGameData = async () => {
      try {
        const data = await getGame(roomCode);
        setGameData(data.game);
        setParticipants(data.participants);
        setIsHost(data.game.host_user_id === userId);
        if (data.snippet_language) {
          setLanguageName(data.snippet_language);
          try {
            localStorage.setItem('preferredLanguage', data.snippet_language);
          } catch {}
        }
      } catch (err) {
        setError("Failed to load game data");
        console.error(err);
      }
    };

    fetchGameData();

    // Connect to Socket.IO
    const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const newSocket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"]
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      newSocket.emit("join_room", { room_code: roomCode, user_id: userId });
    });

    newSocket.on("player_joined", (data) => {
      console.log("Player joined:", data);
      setParticipants(data.participants);
    });

    newSocket.on("player_left", (data) => {
      console.log("Player left:", data);
      // Update participants directly if provided
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      } else {
        // Fallback: refresh game data
        fetchGameData();
      }
      // Handle host transfer
      if (data && data.new_host_id) {
        setGameData((prev) => prev ? { ...prev, host_user_id: data.new_host_id } : prev);
        setIsHost(data.new_host_id === userId);
        if (data.new_host_username) {
          setError(`${data.new_host_username} is now the host`);
          setTimeout(() => setError(""), 3000);
        }
      }
    });

    newSocket.on("game_started", (data) => {
      console.log("Game started:", data);
      if (onStartRace) {
        onStartRace(roomCode);
      }
    });

    newSocket.on("rematch_started", (data) => {
      console.log("Rematch started:", data);
      // Refresh game data to get new snippet
      fetchGameData();
    });

    newSocket.on("game_deleted", (data) => {
      console.log("Game deleted:", data);
      // Navigate back to previous page or home
      if (onBack) {
        onBack();
      }
      // Clear local lobby state
      setParticipants([]);
      setGameData(null);
    });

    newSocket.on("error", (data) => {
      setError(data.message);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit("leave_room", { room_code: roomCode, user_id: userId });
        newSocket.disconnect();
      }
    };
  }, [roomCode, userId]);

  const handleStartGame = async () => {
    try {
      // Emit socket event to start game (backend will broadcast to all players)
      if (socket) {
        // Check if this is a rematch (game status is finished)
        if (gameData && gameData.status === "finished") {
          socket.emit("rematch_game", { room_code: roomCode, user_id: userId });
        } else {
          socket.emit("start_game", { room_code: roomCode, user_id: userId });
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to start game");
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert("Room code copied to clipboard!");
  };

  if (!gameData) {
    return (
      <div className="lobby-container">
        <div className="loading">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <div className="lobby-box">
        <h1 className="lobby-title">Game Lobby</h1>
        
        <div className="room-code-section">
          <div className="room-code-label">Room Code</div>
          <div className="room-code-display" onClick={copyRoomCode}>
            {roomCode}
            <span className="copy-hint">Click to copy</span>
          </div>
        </div>

        {languageName && (
          <div className="language-section">
            <div className="language-label">Language</div>
            <div className="language-display">{languageName}</div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="players-section">
          <h2 className="section-title">
            Players ({participants.length}/{gameData.max_players})
          </h2>
          <div className="players-list">
            {participants.map((participant, idx) => (
              <div key={participant.id} className="player-item">
                <span className="player-number">{idx + 1}</span>
                <span className="player-name">{participant.username}</span>
                {participant.user_id === gameData.host_user_id && (
                  <span className="host-badge">HOST</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lobby-actions">
          {isHost ? (
            <button 
              type="button"
              className="btn btn-primary btn-large"
              onClick={handleStartGame}
              disabled={participants.length < 1}
            >
              Start Game
            </button>
          ) : (
            <div className="waiting-message">
              Waiting for host to start the game...
            </div>
          )}
          
          <button type="button" className="btn btn-outline" onClick={onBack}>
            Leave Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
