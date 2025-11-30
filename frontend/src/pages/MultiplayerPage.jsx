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
        <div className="centered-content">
          <h1 className="page-title">
            Multiplayer Race
          </h1>

          {!userId && (
            <div className="message-box message-info">
              Playing as guest - You can join games but cannot create them
            </div>
          )}

          {error && (
            <div className="message-box message-error">
              {error}
            </div>
          )}

          <div className="card mb-xl">
            <h2 className="section-title">
              Create a New Game
            </h2>
            {!userId && (
              <p className="text-muted mb-md text-small">
                Login required to create games
              </p>
            )}
            <button
              onClick={handleCreateGame}
              disabled={loading || !userId}
              className="btn btn-primary btn-full btn-large"
            >
              {loading ? 'Creating...' : '🎮 Create Game'}
            </button>
          </div>

          <div className="card">
            <h2 className="section-title">
              Join Existing Game
            </h2>

            {!userId && (
              <div className="input-group mb-md">
                <input
                  type="text"
                  placeholder="Enter Your Name (Guest)"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="input-field"
                />
              </div>
            )}

            <div className="input-group mb-md">
              <input
                type="text"
                placeholder="Enter Room Code"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
                className="input-field input-field-code"
              />
            </div>
            <button
              onClick={handleJoinGame}
              disabled={loading || !roomCodeInput.trim() || (!userId && !guestName.trim())}
              className="btn btn-blue btn-full btn-large"
            >
              {loading ? 'Joining...' : '🚀 Join Game'}
            </button>
          </div>

          <button
            onClick={onBack}
            className="btn btn-outline-secondary mt-xl"
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
        <div className="centered-content">
          <h1 className="page-title">
            🏆 Race Results
          </h1>
          <div className="card">
            {raceResults.map((result, idx) => (
              <div 
                key={result.user_id} 
                className={idx === 0 ? "result-item result-winner" : "result-item"}
              >
                <span className="result-position">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${result.position}.`}
                  {' '}{result.username}
                </span>
                <span className="result-stats">
                  {Math.round(result.wpm)} WPM • {Math.round(result.accuracy)}%
                </span>
              </div>
            ))}
          </div>
          <div className="text-center mt-xl">
            <button 
              onClick={handleBackToMenu}
              className="btn btn-primary btn-large"
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