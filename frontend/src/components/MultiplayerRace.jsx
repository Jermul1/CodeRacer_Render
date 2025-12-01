// components/MultiplayerRace.jsx
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getGame } from "../api";
import CodeDisplay from "./CodeDisplay";
import TypingInput from "./TypingInput";
import RaceCountdown from "./RaceCountdown";
import RaceHeader from "./RaceHeader";
import ParticipantsList from "./ParticipantsList";
import "../styles/MultiplayerRace.css";

const MAX_CONSECUTIVE_ERRORS = 7;
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const COUNTDOWN_DURATION = 3;
const RACE_DURATION_MS = 120000; // 1 minute 30 seconds

export default function MultiplayerRace({ roomCode, userId, onFinish }) {
  // Game state
  const [gameData, setGameData] = useState(null);
  const [snippet, setSnippet] = useState("");
  const [participants, setParticipants] = useState([]);
  
  // Typing state
  const [userInput, setUserInput] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState([]);
  
  // Performance tracking
  const [startTime, setStartTime] = useState(null);
  const [endDeadline, setEndDeadline] = useState(null);
  const [timeLeftMs, setTimeLeftMs] = useState(RACE_DURATION_MS);
  const [errors, setErrors] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  
  // UI state
  const [isFinished, setIsFinished] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [raceStarted, setRaceStarted] = useState(false);
  
  // Socket & refs
  const [socket, setSocket] = useState(null);
  const inputRef = useRef(null);

  // Computed values
  const lines = snippet.split('\n');
  const formatTime = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(1, '0')}:${String(r).padStart(2, '0')}`;
  };
  
  const getCurrentLine = () => {
    if (currentLineIndex >= lines.length) return "";
    return lines[currentLineIndex].trimStart();
  };

  // ==================== SOCKET & GAME SETUP ====================
  
  useEffect(() => {
    initializeGame();
    const socket = setupSocket();
    const cleanup = startCountdown();

    return () => {
      cleanupSocket(socket);
      cleanup();
    };
  }, [roomCode, userId]);

  const initializeGame = async () => {
    try {
      const data = await getGame(roomCode);
      setGameData(data.game);
      setSnippet(data.snippet_code);
      setParticipants(data.participants);
    } catch (err) {
      console.error("Failed to load game:", err);
    }
  };

  const setupSocket = () => {
    const newSocket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"]
    });

    newSocket.on("connect", () => {
      console.log("Connected to race");
      newSocket.emit("join_room", { room_code: roomCode, user_id: userId });
    });

    newSocket.on("progress_update", handleProgressUpdate);
    newSocket.on("player_finished", handlePlayerFinished);
    newSocket.on("game_finished", handleGameFinished);

    setSocket(newSocket);
    return newSocket;
  };

  const cleanupSocket = (socket) => {
    if (socket) {
      socket.emit("leave_room", { room_code: roomCode });
      socket.disconnect();
    }
  };

  const startCountdown = () => {
    let count = COUNTDOWN_DURATION;
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(interval);
        setRaceStarted(true);
        const now = Date.now();
        setStartTime(now);
        setEndDeadline(now + RACE_DURATION_MS);
        setTimeLeftMs(RACE_DURATION_MS);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  // ==================== SOCKET EVENT HANDLERS ====================

  const handleProgressUpdate = (data) => {
    setParticipants((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((p) => p.user_id === data.user_id);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], ...data };
      }
      return updated;
    });
  };

  const handlePlayerFinished = (data) => {
    console.log("Player finished:", data);
  };

  const handleGameFinished = (data) => {
    console.log("Game finished:", data);
    if (onFinish) {
      onFinish(data.results);
    }
  };

  // ==================== CALCULATIONS ====================

  const calculateWPM = () => {
    if (!startTime) return 0;
    
    const timeInMinutes = (Date.now() - startTime) / 60000;
    const totalChars = completedLines.join('\n').length + userInput.length;
    const wordsTyped = totalChars / 5;
    
    return Math.round(wordsTyped / timeInMinutes) || 0;
  };

  const calculateAccuracy = () => {
    const totalChars = completedLines.join('\n').length + userInput.length;
    if (totalChars === 0) return 100;
    
    return Math.round(((totalChars - errors) / totalChars) * 100);
  };

  // ==================== INPUT HANDLERS ====================

  const handleInputChange = (e) => {
    if (!raceStarted || isFinished) return;

    const value = e.target.value;
    const currentLine = getCurrentLine();

    // Handle deletion
    if (value.length < userInput.length) {
      setUserInput(value);
      setConsecutiveErrors(0);
      return;
    }

    // Validate new character
    const newCharIndex = value.length - 1;
    const isCorrect = value[newCharIndex] === currentLine[newCharIndex];

    if (isCorrect) {
      setUserInput(value);
      setConsecutiveErrors(0);
    } else {
      handleTypingError(value);
    }
  };

  const handleTypingError = (value) => {
    setErrors((prev) => prev + 1);
    const newConsecutiveErrors = consecutiveErrors + 1;
    setConsecutiveErrors(newConsecutiveErrors);

    if (newConsecutiveErrors <= MAX_CONSECUTIVE_ERRORS) {
      setUserInput(value);
    }
  };

  const handleKeyDown = (e) => {
    if (!raceStarted || isFinished) return;

    // Prevent paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      return;
    }

    // Handle Enter - submit line
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLineSubmission();
    }
  };

  const handleLineSubmission = () => {
    const currentLine = getCurrentLine();

    // Only accept perfect match
    if (userInput !== currentLine) return;

    const newCompletedLines = [...completedLines, lines[currentLineIndex]];
    setCompletedLines(newCompletedLines);
    
    const newLineIndex = currentLineIndex + 1;
    setCurrentLineIndex(newLineIndex);
    setUserInput("");
    setConsecutiveErrors(0);

    // Broadcast progress
    broadcastProgress(newCompletedLines);

    // Check completion
    if (newLineIndex >= lines.length) {
      finishRace();
    }
  };

  const broadcastProgress = (completedLines) => {
    if (!socket) return;

    const totalChars = completedLines.join('\n').length;
    
    socket.emit("update_progress", {
      room_code: roomCode,
      user_id: userId,
      progress: totalChars,
      wpm: calculateWPM(),
      accuracy: calculateAccuracy()
    });
  };

  const finishRace = () => {
    setIsFinished(true);
    
    if (socket) {
      socket.emit("finish_race", {
        room_code: roomCode,
        user_id: userId,
        wpm: calculateWPM(),
        accuracy: calculateAccuracy()
      });
    }
  };

  // ==================== TIMER TICK ====================
  useEffect(() => {
    if (!raceStarted || !endDeadline || isFinished) return;
    const tick = setInterval(() => {
      const left = endDeadline - Date.now();
      if (left <= 0) {
        clearInterval(tick);
        setTimeLeftMs(0);
        if (!isFinished) {
          // Time's up: finish race with current stats
          setIsFinished(true);
          if (socket) {
            socket.emit("finish_race", {
              room_code: roomCode,
              user_id: userId,
              wpm: calculateWPM(),
              accuracy: calculateAccuracy()
            });
          }
        }
      } else {
        setTimeLeftMs(left);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [raceStarted, endDeadline, isFinished, socket]);

  // ==================== AUTO-FOCUS EFFECT ====================

  useEffect(() => {
    const handleClick = () => {
      if (raceStarted && !isFinished) {
        inputRef.current?.focus();
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [raceStarted, isFinished]);

  // ==================== RENDER ====================

  if (!gameData || !snippet) {
    return <div className="race-loading">Loading race...</div>;
  }

  if (countdown > 0) {
    return <RaceCountdown countdown={countdown} />;
  }

  return (
    <div className="race-container">
      <RaceHeader
        roomCode={roomCode}
        wpm={calculateWPM()}
        accuracy={calculateAccuracy()}
        currentLine={currentLineIndex + 1}
        totalLines={lines.length}
        timeText={formatTime(timeLeftMs)}
      />

      <ParticipantsList
        participants={participants}
        totalSnippetLength={snippet.length}
      />

      <CodeDisplay
        lines={lines}
        currentLineIndex={currentLineIndex}
        completedLines={completedLines}
        userInput={userInput}
      />

      <TypingInput
        value={userInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        consecutiveErrors={consecutiveErrors}
        maxErrors={MAX_CONSECUTIVE_ERRORS}
        currentLine={getCurrentLine()}
        lineNumber={currentLineIndex + 1}
        totalLines={lines.length}
        autoFocus={false}
        disabled={!raceStarted || isFinished}
      />

      {isFinished && (
        <div className="finish-message">
          🎉 You finished! Waiting for other players...
        </div>
      )}
    </div>
  );
}