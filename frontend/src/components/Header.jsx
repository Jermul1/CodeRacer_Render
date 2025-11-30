// components/Header.jsx
export default function Header({ currentUser, onLogout, onHome }) {
  return (
    <header className="app-header">
      <div className="app-logo" onClick={onHome}>
        &lt;CodeRacer/&gt;
      </div>
      
      <div className="header-user-info">
        {currentUser ? (
          <>
            <span className="user-welcome">
              Welcome, <strong className="username">{currentUser.username}</strong>
            </span>
            <button className="btn btn-danger" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <span className="guest-mode">
            Guest Mode
          </span>
        )}
      </div>
    </header>
  );
}
