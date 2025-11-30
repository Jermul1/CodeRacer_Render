import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SoloRacePage from "./pages/SoloRacePage";
import MultiplayerPage from "./pages/MultiplayerPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

function AppContent() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from sessionStorage on mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem('coderacer_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        sessionStorage.removeItem('coderacer_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem('coderacer_user', JSON.stringify(userData));
    console.log("User logged in:", userData);
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('coderacer_user');
    navigate("/");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  // Show loading state while checking sessionStorage
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: '#0f0c29',
        color: '#00e0c6',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <HomePage
            onStartSoloRace={() => navigate("/solo")}
            onStartMultiplayer={() => navigate("/multiplayer")}
            onLogin={handleLogin}
            onLogout={handleLogout}
            currentUser={user}
          />
        } 
      />
      <Route 
        path="/solo" 
        element={
          <div style={{ minHeight: "100vh", background: "#0f0c29", color: "#fff", display: "flex", flexDirection: "column" }}>
            <Header currentUser={user} onLogout={handleLogout} onHome={handleBackToHome} />
            <div style={{ flex: 1, padding: "2rem" }}>
              <SoloRacePage onBack={handleBackToHome} />
            </div>
            <Footer />
          </div>
        } 
      />
      <Route 
        path="/multiplayer" 
        element={
          <div style={{ minHeight: "100vh", background: "#0f0c29", color: "#fff", display: "flex", flexDirection: "column" }}>
            <Header currentUser={user} onLogout={handleLogout} onHome={handleBackToHome} />
            <div style={{ flex: 1 }}>
              <MultiplayerPage
                userId={user?.user_id}
                username={user?.username}
                onBack={handleBackToHome}
              />
            </div>
            <Footer />
          </div>
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}