// pages/MultiplayerPage.jsx
import { useState } from "react";
import { createGame, joinGame, signup, getAvailableLanguages } from "../api";
import GameLobby from "../components/GameLobby";
import { getGame } from "../api";
import MultiplayerRace from "../components/MultiplayerRace";
import "../styles/MultiplayerRace.css";

export default function MultiplayerPage({ userId, username, onBack }) {
  const [view, setView] = useState("menu"); // menu, lobby, race, results
  const [roomCode, setRoomCode] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [raceResults, setRaceResults] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [guestUserId, setGuestUserId] = useState(null);
  const [creatingGuest, setCreatingGuest] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    try {
      return localStorage.getItem('preferredLanguage') || "";
    } catch {
      return "";
    }
  });

  const effectiveUserId = userId || guestUserId;
  const effectiveUsername = username || guestName || "Guest";

  // Fetch languages once when menu is shown first time
  if (view === 'menu' && languages.length === 0 && !languagesLoading) {
    (async () => {
      try {
        setLanguagesLoading(true);
        const langs = await getAvailableLanguages();
        setLanguages(langs);
        if (langs.length && !selectedLanguage) {
          const initial = localStorage.getItem('preferredLanguage') || langs[0];
          setSelectedLanguage(initial);
        }
      } catch (e) {
        console.error('Failed to load languages', e);
      } finally {
        setLanguagesLoading(false);
      }
    })();
  }

  const handleCreateGame = async () => {
    if (!userId) {
      setError("You must be logged in to create a game");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const languageToSend = selectedLanguage || null;
      const response = await createGame(userId, null, 4, languageToSend);
      setRoomCode(response.room_code);
      setView("lobby");
    } catch (err) {
      setError(err.message || "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  const createGuestIfNeeded = async () => {
    if (guestUserId) return guestUserId;
    const raw = guestName.trim();
    if (!raw) throw new Error("Guest name required");
    setCreatingGuest(true);
    try {
      const base = raw.slice(0, 18).replace(/\s+/g, '_');
      const suffix = Math.random().toString(36).slice(2, 6);
      const uniqueUsername = `${base}_${suffix}`;
      // Use a valid domain; 'example.com' is safe & reserved
      const pseudoEmail = `guest_${Date.now()}_${suffix}@example.com`;
      const pseudoPassword = `g_${Math.random().toString(36).slice(2, 10)}`;

      const res = await signup(uniqueUsername, pseudoEmail, pseudoPassword);
      setGuestUserId(res.id);
      return res.id;
    } catch (e) {
      // If we get a validation array, surface it
      console.error("Guest signup failed:", e);
      setError(e.message || "Failed to create guest identity");
      throw e;
    } finally {
      setCreatingGuest(false);
    }
  };

  const handleJoinGame = async () => {
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
      let idToUse = userId;
      if (!idToUse) {
        idToUse = await createGuestIfNeeded();
      }

      await joinGame(idToUse, roomCodeInput.toUpperCase());
      setRoomCode(roomCodeInput.toUpperCase());
      setView("lobby");
    } catch (err) {
      setError(err.message || "Failed to join game");
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
    setGuestUserId(null);
  };

  // -------- Menu View --------
  if (view === "menu") {
    return (
      <div className="race-container">
        <div className="centered-content">
          <h1 className="page-title">Multiplayer Race</h1>

            {!userId && (
              <div className="message-box message-info">
                Playing as guest – You can join games but cannot create them
              </div>
            )}

            {error && (
              <div className="message-box message-error">
                {String(error)}
              </div>
            )}

            <div className="card mb-xl">
              <h2 className="section-title">Create a New Game</h2>
              {!userId && (
                <p className="text-muted mb-md text-small">
                  Login required to create games
                </p>
              )}
              <div className="input-group mb-md">
                <label className="input-label">Language</label>
                <select
                  className="input-field"
                  value={selectedLanguage}
                  disabled={languagesLoading || !languages.length}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedLanguage(value);
                    try { localStorage.setItem('preferredLanguage', value); } catch {}
                  }}
                >
                  {languagesLoading && <option>Loading...</option>}
                  {!languagesLoading && languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleCreateGame}
                disabled={loading || !userId}
                className="btn btn-primary btn-full btn-large"
              >
                {loading ? 'Creating...' : '🎮 Create Game'}
              </button>
            </div>

            <div className="card">
              <h2 className="section-title">Join Existing Game</h2>

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
                type="button"
                onClick={handleJoinGame}
                disabled={
                  loading ||
                  creatingGuest ||
                  !roomCodeInput.trim() ||
                  (!userId && !guestName.trim())
                }
                className="btn btn-blue btn-full btn-large"
              >
                {loading || creatingGuest ? 'Joining...' : '🚀 Join Game'}
              </button>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="btn btn-outline-secondary mt-xl"
            >
              ← Back to Home
            </button>
        </div>
      </div>
    );
  }

  // -------- Lobby View --------
  if (view === "lobby") {
    return (
      <GameLobby
        roomCode={roomCode}
        userId={effectiveUserId}
        username={effectiveUsername}
        onStartRace={handleStartRace}
        onBack={handleBackToMenu}
      />
    );
  }

  // -------- Race View --------
  if (view === "race") {
    return (
      <MultiplayerRace
        roomCode={roomCode}
        userId={effectiveUserId}
        username={effectiveUsername}
        onFinish={handleRaceFinish}
      />
    );
  }

  // -------- Results View --------
  if (view === "results" && raceResults) {
    return (
      <div className="race-container">
        <div className="centered-content">
          <h1 className="page-title">🏆 Race Results</h1>
          <div className="card">
            {raceResults.map((result, idx) => (
              <div
                key={result.user_id}
                className={idx === 0 ? "result-item result-winner" : "result-item"}
              >
                <span className="result-position">
                  {idx === 0
                    ? '🥇'
                    : idx === 1
                    ? '🥈'
                    : idx === 2
                    ? '🥉'
                    : `${result.position}.`}{" "}
                  {result.username}
                </span>
                <span className="result-stats">
                  {Math.round(result.wpm)} WPM • {Math.round(result.accuracy)}%
                </span>
              </div>
            ))}
          </div>
          <div className="text-center mt-md">
            <button
              type="button"
              className="btn btn-primary btn-large"
              disabled={!userId}
              onClick={async () => {
                try {
                  // Use previous game's language for rematch
                  const details = await getGame(roomCode);
                  const stored = (() => { try { return localStorage.getItem('preferredLanguage'); } catch { return null; } })();
                  const lang = details?.snippet_language || stored || selectedLanguage || null;
                  const response = await createGame(userId, null, 4, lang);
                  setRoomCode(response.room_code);
                  setRaceResults(null);
                  setView("race"); 
                } catch (e) {
                  setError(e.message || "Failed to start a new game");
                }
              }}
            >
              🔁 Play Again
            </button>
            {!userId && (
              <div className="text-muted mt-sm text-small">Login required to create a new game</div>
            )}
          </div>
          <div className="text-center mt-xl">
            <button
              type="button"
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