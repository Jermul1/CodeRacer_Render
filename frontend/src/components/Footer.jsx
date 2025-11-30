// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span>© 2025 CodeRacer</span>
        <span>•</span>
        <span>You either code in the sink or sink in the code.</span>
        <span>•</span>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-link"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
