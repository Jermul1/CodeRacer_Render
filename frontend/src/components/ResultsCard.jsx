// components/ResultsCard.jsx
export default function ResultsCard({ wpm, accuracy, onPlayAgain, onBack }) {
  return (
    <div style={{
      padding: '2rem',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center'
    }}>
      <h2 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: '#00e0c6'
      }}>
        Typing Test Complete!
      </h2>
      <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
        Words per minute: <strong style={{ color: '#00e0c6' }}>{wpm}</strong>
      </div>
      <div style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Accuracy: <strong style={{ color: '#00e0c6' }}>{accuracy}%</strong>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onPlayAgain}
          style={{
            padding: '0.75rem 2rem',
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
          Play Again
        </button>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '0.75rem 2rem',
              background: 'transparent',
              color: '#b8b8d1',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 600,
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
        )}
      </div>
    </div>
  );
}