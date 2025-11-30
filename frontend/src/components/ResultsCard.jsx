// components/ResultsCard.jsx
export default function ResultsCard({ wpm, accuracy, onPlayAgain, onBack }) {
  return (
    <div className="results-container">
      <h2 className="results-title">
        Typing Test Complete!
      </h2>
      <div className="results-stats">
        <div className="stat-row">
          Words per minute: <strong className="stat-value">{wpm}</strong>
        </div>
        <div className="stat-row">
          Accuracy: <strong className="stat-value">{accuracy}%</strong>
        </div>
      </div>
      <div className="results-actions">
        <button
          onClick={onPlayAgain}
          className="btn btn-primary btn-large"
        >
          Play Again
        </button>
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-outline-secondary btn-large"
          >
            ← Back to Home
          </button>
        )}
      </div>
    </div>
  );
}