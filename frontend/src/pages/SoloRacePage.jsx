// pages/SoloRacePage.jsx
import { useEffect, useState } from "react";
import { getRandomSnippet, getAvailableLanguages } from "../api";
import CodeDisplay from "../components/CodeDisplay";
import TypingInput from "../components/TypingInput";
import StatsPanel from "../components/StatsPanel";
import ResultsCard from "../components/ResultsCard";
import Instructions from "../components/Instructions";
import "../styles/MultiplayerRace.css";

// Fallback snippet if backend is unavailable
const FALLBACK_SNIPPET = `@router.get("/random", response_model=SnippetResponse)
def get_random_snippet(
    snippet_service: SnippetService = Depends(get_snippet_service)):
    """Get a random code snippet"""
    return snippet_service.get_random_snippet()`;

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
  const [timeRanOut, setTimeRanOut] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    try {
      return localStorage.getItem('preferredLanguage') || 'python';
    } catch {
      return 'python';
    }
  });

  const MAX_CONSECUTIVE_ERRORS = 7;
  const RACE_DURATION_MS = 120000; // 2 minutes
  const [endDeadline, setEndDeadline] = useState(null);
  const [timeLeftMs, setTimeLeftMs] = useState(RACE_DURATION_MS);
  const formatTime = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(1, '0')}:${String(r).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Load available languages once
    (async () => {
      try {
        setLanguagesLoading(true);
        const langs = await getAvailableLanguages();
        setLanguages(langs);
        if (langs.length && !selectedLanguage) {
          const initial = localStorage.getItem('preferredLanguage') || langs[0];
          setSelectedLanguage(initial);
        }
      } catch (err) {
        console.error("Failed to load languages", err);
      } finally {
        setLanguagesLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // Fetch snippet when language changes
    async function fetchPassage(lang) {
      try {
        const data = await getRandomSnippet(lang || "python");
        const text =
          data?.text ?? data?.snippet ?? data?.code ?? data?.snippet_code ??
          (typeof data === "string" ? data : JSON.stringify(data));
        setSnippet(text);
        setLines(text.split('\n'));
        // Reset race state on snippet change
        setUserInput("");
        setCurrentLineIndex(0);
        setCompletedLines([]);
        setIsFinished(false);
        setStartTime(null);
        setEndTime(null);
        setErrors(0);
        setConsecutiveErrors(0);
        setEndDeadline(null);
        setTimeLeftMs(RACE_DURATION_MS);
        setTimeRanOut(false);
      } catch (err) {
        console.error("Error fetching passage:", err);
        console.log("Using fallback snippet");
        setSnippet(FALLBACK_SNIPPET);
        setLines(FALLBACK_SNIPPET.split('\n'));
      }
    }
    fetchPassage(selectedLanguage);
  }, [selectedLanguage]);

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

    // If user is deleting, allow it and decrement error counter
    if (value.length < userInput.length) {
      setUserInput(value);
      if (consecutiveErrors > 0) {
        setConsecutiveErrors(prev => prev - 1);
      }
      return;
    }

    // Block typing if already at max errors
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      return;
    }

    // Check if the new character is correct
    const newCharIndex = value.length - 1;
    const isCorrect = value[newCharIndex] === currentLine[newCharIndex];

    if (isCorrect) {
      setUserInput(value);
      // Reset errors when correct character is typed
      if (consecutiveErrors > 0) {
        setConsecutiveErrors(0);
      }
    } else {
      setErrors((prev) => prev + 1);
      setConsecutiveErrors(prev => prev + 1);
      setUserInput(value);
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
          setTimeRanOut(true);
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
    
    const accuracy = ((totalChars - errors) / totalChars) * 100;
    return Math.max(0, Math.round(accuracy)); // Ensure it never goes below 0
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
      <div className="loading-container">
        Loading snippet...
      </div>
    );
  }

  // Calculate progress percentage
  const totalChars = snippet.length;
  const currentChars = completedLines.join('\n').length + userInput.length;
  const progressPercentage = (currentChars / totalChars) * 100;

  return (
    <div className="race-container">
      {!isFinished ? (
        <>
          <div className="race-header">
            <h2 className="race-title">Solo Race</h2>
            <div className="race-language-select">
              <label className="input-label" style={{ marginRight: 8 }}>Language</label>
              <select
                className="input-field"
                value={selectedLanguage}
                disabled={languagesLoading && !languages.length}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedLanguage(value);
                  try { localStorage.setItem('preferredLanguage', value); } catch {}
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              >
                {languagesLoading && <option>Loading...</option>}
                {!languagesLoading && languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
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
                <span className="stat-label">Time</span>
                <span className="stat-value">{formatTime(timeLeftMs)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="participants-progress">
            <div className="participant-row">
              <div className="participant-info">
                <span className="participant-name">Your Progress</span>
                <span className="participant-wpm">{calculateWPM()} WPM</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${progressPercentage}%` }}
                >
                  {isFinished && <span className="finish-flag">Finish</span>}
                </div>
              </div>
            </div>
          </div>

          <Instructions />

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
            <div className="text-center mt-xl">
              <button
                onClick={onBack}
                className="btn btn-outline-secondary"
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
          timeRanOut={timeRanOut}
          onPlayAgain={() => window.location.reload()}
          onBack={onBack}
        />
      )}
    </div>
  );
}