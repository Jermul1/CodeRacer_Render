// components/Header.jsx
export default function Header({ currentUser, onLogout, onHome }) {
  return (
    <header style={{
      background: 'rgba(0, 0, 0, 0.3)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div 
        onClick={onHome}
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#00e0c6',
          cursor: 'pointer',
          transition: 'opacity 0.2s'
        }}
        onMouseOver={(e) => e.target.style.opacity = '0.8'}
        onMouseOut={(e) => e.target.style.opacity = '1'}
      >
        &lt;CodeRacer/&gt;
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {currentUser ? (
          <>
            <span style={{ color: '#b8b8d1' }}>
              Welcome, <strong style={{ color: '#00e0c6' }}>{currentUser.username}</strong>
            </span>
            <button
              onClick={onLogout}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: '#e74c3c',
                border: '1px solid #e74c3c',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#e74c3c';
                e.target.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#e74c3c';
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <span style={{ color: '#b8b8d1', fontSize: '0.9rem' }}>
            Guest Mode
          </span>
        )}
      </div>
    </header>
  );
}
