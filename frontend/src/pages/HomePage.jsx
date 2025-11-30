// pages/HomePage.jsx
import { useState } from "react";
import LogoAnimation from "../components/LogoAnimation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { signup, login } from "../api";
import "../styles/FrontPage.css";

export default function HomePage({ onStartSoloRace, onStartMultiplayer, onLogin, onLogout, currentUser }) {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccessMessage("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (isLogin) {
        const response = await login(formData.email, formData.password);
        console.log("Login successful:", response);
        if (onLogin) {
          onLogin(response);
        }
        setShowAuth(false);
        setFormData({ username: "", email: "", password: "" });
      } else {
        const response = await signup(formData.username, formData.email, formData.password);
        console.log("Signup successful:", response);
        setIsLogin(true);
        setFormData({ username: "", email: "", password: "" });
        setSuccessMessage("Account created! Please log in.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setShowAuth(false);
    setError("");
    setSuccessMessage("");
    setFormData({ username: "", email: "", password: "" });
  };

  // Auth Modal View
  if (showAuth) {
    return (
      <div className="app-container">
        <Header currentUser={currentUser} onLogout={onLogout} onHome={handleBackToHome} />

        <main className="main-content">
          <div className="auth-container">
            <div className="auth-box">
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${isLogin ? 'active' : ''}`}
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                    setSuccessMessage("");
                  }}
                >
                  Login
                </button>
                <button
                  className={`auth-tab ${!isLogin ? 'active' : ''}`}
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                    setSuccessMessage("");
                  }}
                >
                  Sign Up
                </button>
              </div>

              {error && (
                <div className="auth-message error">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="auth-message success">
                  {successMessage}
                </div>
              )}

              <form className="auth-form" onSubmit={handleAuth}>
                {!isLogin && (
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-full"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
                </button>

                <button
                  type="button"
                  className="btn btn-text btn-full"
                  onClick={handleBackToHome}
                >
                  ← Back to Home
                </button>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Main Home View
  return (
    <div className="app-container">
      <Header currentUser={currentUser} onLogout={onLogout} onHome={() => {}} />

      <main className="main-content">
        <div className="text-center mb-xl">
          <LogoAnimation />
          <p className="tagline">Type code. Race the clock. Beat your best.</p>
        </div>

        <div className="action-buttons w-full max-w-sm">
          <button 
            className="btn btn-primary btn-full"
            onClick={onStartSoloRace}
          >
            <span className="btn-icon"></span>
            Solo Race
          </button>

          {/* Multiplayer Button */}
          <button 
            className="btn btn-secondary btn-full"
            onClick={onStartMultiplayer}
          >
            <span className="btn-icon"></span>
            Multiplayer
          </button>

          {/* Login Button */}
          {!currentUser && (
            <button 
              className="btn btn-outline btn-full"
              onClick={() => setShowAuth(true)}
            >
              <span className="btn-icon"></span>
              Login / Sign Up
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}