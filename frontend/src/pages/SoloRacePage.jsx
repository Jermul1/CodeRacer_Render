// pages/SoloRacePage.jsx
import { useEffect, useState } from "react";
import { getRandomSnippet } from "../api";
import CodeDisplay from "../components/CodeDisplay";
import TypingInput from "../components/TypingInput";
import StatsPanel from "../components/StatsPanel";
import ResultsCard from "../components/ResultsCard";
import "../styles/MultiplayerRace.css";

export default function SoloRacePage({ onBack }) {
  const [snippet, setSnippet] = useState("");
  const [lines, setLines] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [errors, setErrors] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

  const MAX_CONSECUTIVE_ERRORS = 7;
  const RACE_DURATION_MS = 90_000; // 1 minute 30 seconds
  const [endDeadline, setEndDeadline] = useState(null);
  const [timeLeftMs, setTimeLeftMs] = useState(RACE_DURATION_MS);
  const formatTime = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(1, '0')}:${String(r).padStart(2, '0')}`;
  };

  useEffect(() => {
    async function fetchPassage() {
      try {
        const data = await getRandomSnippet("python");
        const text =
          data?.text ?? data?.snippet ?? data?.code ?? data?.snippet_code ?? 
          (typeof data === "string" ? data : JSON.stringify(data));
        setSnippet(text);
        setLines(text.split('\n'));
      } catch (err) {
        console.error("Error fetching passage:", err);
      }
    }
    fetchPassage();
  }, []);

  // Get the trimmed version of current line (target to type)
  const getCurrentLine = () => {
    if (currentLineIndex >= lines.length) return "";
    return lines[currentLineIndex].trimStart();
  };

  const handleInputChange = (e) => {
    if (isFinished) return;

    const value = e.target.value;
    const currentLine = getCurrentLine();

    // Start timer on first keypress
    if (!startTime) {
      const now = Date.now();
      setStartTime(now);
      setEndDeadline(now + RACE_DURATION_MS);
      setTimeLeftMs(RACE_DURATION_MS);
    }

    // If user is deleting, allow it and reset consecutive errors
    if (value.length < userInput.length) {
      setUserInput(value);
      setConsecutiveErrors(0);
      return;
    }

    // Check if the new character is correct
    const newCharIndex = value.length - 1;
    const isCorrect = value[newCharIndex] === currentLine[newCharIndex];

    if (isCorrect) {
      setUserInput(value);
      setConsecutiveErrors(0);
    } else {
      setErrors((prev) => prev + 1);
      const newConsecutiveErrors = consecutiveErrors + 1;
      setConsecutiveErrors(newConsecutiveErrors);

      if (newConsecutiveErrors <= MAX_CONSECUTIVE_ERRORS) {
        setUserInput(value);
      }
    }
  };

  // Timer tick for solo
  useEffect(() => {
    if (!endDeadline || isFinished) return;
    const tick = setInterval(() => {
      const left = endDeadline - Date.now();
      if (left <= 0) {
        clearInterval(tick);
        setTimeLeftMs(0);
        if (!isFinished) {
          const end = Date.now();
          setEndTime(end);
          setIsFinished(true);
        }
      } else {
        setTimeLeftMs(left);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [endDeadline, isFinished]);

  const handleKeyDown = (e) => {
    if (isFinished) return;

    // Prevent paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      return;
    }

    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentLine = getCurrentLine();

      // Check if current line is completed with 100% accuracy
      if (userInput === currentLine) {
        const newCompletedLines = [...completedLines, lines[currentLineIndex]];
        setCompletedLines(newCompletedLines);
        
        const newLineIndex = currentLineIndex + 1;
        setCurrentLineIndex(newLineIndex);
        setUserInput("");
        setConsecutiveErrors(0);

        // Check if finished
        if (newLineIndex >= lines.length) {
          const end = Date.now();
          setEndTime(end);
          setIsFinished(true);
        }
      }
    }
  };

  const calculateWPM = () => {
    if (!startTime) return 0;
    const currentTime = endTime || Date.now();
    const timeInMinutes = (currentTime - startTime) / 60000;
    const totalChars = completedLines.join('\n').length + userInput.length;
    const wordsTyped = totalChars / 5;
    return Math.round(wordsTyped / timeInMinutes) || 0;
  };

  const calculateAccuracy = () => {
    const totalChars = completedLines.join('\n').length + userInput.length;
    if (totalChars === 0) return 100;
    return Math.round(((totalChars - errors) / totalChars) * 100);
  };

  const calculateResults = () => {
    if (!startTime || !endTime) return { wpm: 0, accuracy: 0 };

    const timeInMinutes = (endTime - startTime) / 1000 / 60;
    const totalChars = snippet.length;
    const wordsTyped = totalChars / 5;
    const wpm = Math.round(wordsTyped / timeInMinutes);

    const totalTypedChars = completedLines.join('\n').length;
    const accuracy = totalTypedChars > 0
      ? Math.max(0, ((totalTypedChars - errors) / totalTypedChars) * 100).toFixed(1)
      : 0;

    return { wpm, accuracy };
  };

  const { wpm, accuracy } = calculateResults();

  if (!snippet) {
    return (
      <div className="race-loading">
        Loading snippet...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {!isFinished ? (
        <>
          <div className="race-header">
            <h2 className="race-title">Solo Race</h2>
            <div className="race-stats">
              <div className="stat">
                <span className="stat-label">WPM</span>
                <span className="stat-value">{calculateWPM()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">{calculateAccuracy()}%</span>
              </div>
              <div className="stat">
                <span className="stat-label">Line</span>
                <span className="stat-value">{currentLineIndex + 1}/{lines.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Time</span>
                <span className="stat-value">{formatTime(timeLeftMs)}</span>
              </div>
            </div>
          </div>

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
            autoFocus
          />

          {onBack && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={onBack}
                style={{
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
          )}
        </>
      ) : (
        <ResultsCard
          wpm={wpm}
          accuracy={accuracy}
          onPlayAgain={() => window.location.reload()}
          onBack={onBack}
        />
      )}
    </div>
  );
}