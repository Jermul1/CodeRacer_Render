// pages/MultiplayerPage.jsx
import { useState } from "react";
import { createGame, joinGame } from "../api";
import GameLobby from "../components/GameLobby";
import MultiplayerRace from "../components/MultiplayerRace";
import "../styles/MultiplayerRace.css";

export default function MultiplayerPage({ userId, username, onBack }) {
  const [view, setView] = useState("menu"); // menu, lobby, race
  const [roomCode, setRoomCode] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [raceResults, setRaceResults] = useState(null);
  const [guestName, setGuestName] = useState("");

  const handleCreateGame = async () => {
    if (!userId) {
      setError("You must be logged in to create a game");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createGame(userId);
      setRoomCode(response.room_code);
      setView("lobby");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    // Allow guests to join, but they need a name
    if (!userId && !guestName.trim()) {
      setError("Please enter a guest name to join");
      return;
    }

    if (!roomCodeInput.trim()) {
      setError("Please enter a room code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // If guest (no userId), we'll use guest name as identifier
      const playerIdentifier = userId || `guest_${Date.now()}`;
      await joinGame(playerIdentifier, roomCodeInput.toUpperCase());
      setRoomCode(roomCodeInput.toUpperCase());
      setView("lobby");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to join game");
    } finally {
      setLoading(false);
    }
  };

  const handleStartRace = () => {
    setView("race");
  };

  const handleRaceFinish = (results) => {
    setRaceResults(results);
    setView("results");
  };

  const handleBackToMenu = () => {
    setView("menu");
    setRoomCode("");
    setRoomCodeInput("");
    setError("");
    setRaceResults(null);
    setGuestName("");
  };

  const effectiveUsername = username || guestName || "Guest";

  // Menu view - Create or Join Game
  if (view === "menu") {
    return (
      <div className="race-container">
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          textAlign: 'center',
          paddingTop: '4rem'
        }}>
          <h1 className="race-title" style={{ fontSize: '3rem', marginBottom: '2rem' }}>
            Multiplayer Race
          </h1>

          {!userId && (
            <div style={{
              background: 'rgba(74, 144, 226, 0.1)',
              border: '2px solid rgba(74, 144, 226, 0.5)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
              color: '#4a90e2'
            }}>
              Playing as guest - You can join games but cannot create them
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(231, 76, 60, 0.1)',
              border: '2px solid rgba(231, 76, 60, 0.5)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
              color: '#e74c3c'
            }}>
              {error}
            </div>
          )}

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem',
              color: '#00e0c6'
            }}>
              Create a New Game
            </h2>
            {!userId && (
              <p style={{
                color: '#b8b8d1',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                Login required to create games
              </p>
            )}
            <button
              onClick={handleCreateGame}
              disabled={loading || !userId}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: 600,
                background: userId ? 'linear-gradient(135deg, #00e0c6 0%, #00a896 100%)' : '#666',
                color: userId ? '#0f0c29' : '#999',
                border: 'none',
                borderRadius: '8px',
                cursor: userId ? 'pointer' : 'not-allowed',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: userId ? '0 4px 15px rgba(0, 224, 198, 0.3)' : 'none'
              }}
              onMouseOver={(e) => {
                if (userId && !loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 224, 198, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (userId) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 224, 198, 0.3)';
                }
              }}
            >
              {loading ? 'Creating...' : '🎮 Create Game'}
            </button>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '2rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem',
              color: '#00e0c6'
            }}>
              Join Existing Game
            </h2>

            {!userId && (
              <input
                type="text"
                placeholder="Enter Your Name (Guest)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  marginBottom: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00e0c6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
              />
            )}

            <input
              type="text"
              placeholder="Enter Room Code"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.2rem',
                fontFamily: "'Courier New', monospace",
                textAlign: 'center',
                letterSpacing: '0.2em',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                marginBottom: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00e0c6'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />
            <button
              onClick={handleJoinGame}
              disabled={loading || !roomCodeInput.trim() || (!userId && !guestName.trim())}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: 600,
                background: (roomCodeInput.trim() && (userId || guestName.trim())) 
                  ? 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)' 
                  : '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: (roomCodeInput.trim() && (userId || guestName.trim())) ? 'pointer' : 'not-allowed',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: (roomCodeInput.trim() && (userId || guestName.trim())) 
                  ? '0 4px 15px rgba(74, 144, 226, 0.3)' 
                  : 'none'
              }}
              onMouseOver={(e) => {
                if (roomCodeInput.trim() && (userId || guestName.trim()) && !loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(74, 144, 226, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (roomCodeInput.trim() && (userId || guestName.trim())) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(74, 144, 226, 0.3)';
                }
              }}
            >
              {loading ? 'Joining...' : '🚀 Join Game'}
            </button>
          </div>

          <button
            onClick={onBack}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 500,
              background: 'transparent',
              color: '#b8b8d1',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#00e0c6';
              e.target.style.color = '#00e0c6';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.color = '#b8b8d1';
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Lobby view
  if (view === "lobby") {
    return (
      <GameLobby
        roomCode={roomCode}
        userId={userId || `guest_${Date.now()}`}
        username={effectiveUsername}
        onStartRace={handleStartRace}
        onBack={handleBackToMenu}
      />
    );
  }

  // Race view
  if (view === "race") {
    return (
      <MultiplayerRace
        roomCode={roomCode}
        userId={userId || `guest_${Date.now()}`}
        username={effectiveUsername}
        onFinish={handleRaceFinish}
      />
    );
  }

  // Results view
  if (view === "results" && raceResults) {
    return (
      <div className="race-container">
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto',
          paddingTop: '4rem'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '2rem', 
            color: '#00e0c6',
            textAlign: 'center'
          }}>
            🏆 Race Results
          </h1>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '2rem', 
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {raceResults.map((result, idx) => (
              <div key={result.user_id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                marginBottom: '1rem',
                background: idx === 0 
                  ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                  : 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                color: idx === 0 ? '#000' : '#fff'
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${result.position}.`}
                  {' '}{result.username}
                </span>
                <span style={{ fontSize: '1rem' }}>
                  {Math.round(result.wpm)} WPM • {Math.round(result.accuracy)}%
                </span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={handleBackToMenu}
              style={{ 
                padding: '1rem 2rem', 
                background: '#00e0c6', 
                color: '#0f0c29',
                border: 'none', 
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Back to Multiplayer Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}