// components/StatsPanel.jsx
export default function StatsPanel({ wpm, accuracy, currentWord, totalWords }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <StatItem label="WPM" value={wpm} />
        <StatItem label="Accuracy" value={`${accuracy}%`} />
        <StatItem label="Words" value={`${currentWord}/${totalWords}`} />
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: '0.8rem', color: '#b8b8d1', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00e0c6' }}>
        {value}
      </span>
    </div>
  );
}