// components/Footer.jsx
export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(0, 0, 0, 0.3)',
      padding: '1.5rem 2rem',
      marginTop: 'auto',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
        color: '#b8b8d1',
        fontSize: '0.9rem'
      }}>
        <span>© 2025 CodeRacer</span>
        <span>•</span>
        <span>You either code in the sink or sink in the code.</span>
        <span>•</span>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            color: '#00e0c6',
            textDecoration: 'none',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.7'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
