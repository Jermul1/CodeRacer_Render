// components/RaceHeader.jsx
export default function RaceHeader({ roomCode, wpm, accuracy, currentLine, totalLines, timeText, language }) {
  return (
    <div className="race-header">
      <h2 className="race-title">Room: {roomCode}</h2>
      {language && (
        <div className="race-language">Language: {language}</div>
      )}
      <div className="race-stats">
        <div className="stat">
          <span className="stat-label">WPM</span>
          <span className="stat-value">{wpm}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Accuracy</span>
          <span className="stat-value">{accuracy}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Line</span>
          <span className="stat-value">{currentLine}/{totalLines}</span>
        </div>
        {typeof timeText === 'string' && (
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{timeText}</span>
          </div>
        )}
      </div>
    </div>
  );
}