import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getRandomSnippet = async (language = 'python') => {
  try {
    const res = await axios.get(`${API_URL}/snippets/${language}`);
    console.log('API Response:', res.data);
    return res.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getAvailableLanguages = async () => {
  try {
    const res = await axios.get(`${API_URL}/snippets`);
    return res.data.languages;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const signup = async (username, email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, {
      username,
      email,
      password
    });
    return res.data;
  } catch (error) {
    console.error('Signup Error:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    // Backend expects JSON body for login
    const res = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    return res.data;
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

// Game/Multiplayer APIs
export const createGame = async (userId, snippetId = null, maxPlayers = 4) => {
  try {
    const res = await axios.post(`${API_URL}/games/create`, {
      user_id: userId,
      snippet_id: snippetId,
      max_players: maxPlayers
    });
    return res.data;
  } catch (error) {
    console.error('Create Game Error:', error);
    throw error;
  }
};

export const joinGame = async (userId, roomCode) => {
  try {
    const res = await axios.post(`${API_URL}/games/join`, {
      user_id: userId,
      room_code: roomCode
    });
    return res.data;
  } catch (error) {
    console.error('Join Game Error:', error);
    throw error;
  }
};

export const getGame = async (roomCode) => {
  try {
    const res = await axios.get(`${API_URL}/games/${roomCode}`);
    return res.data;
  } catch (error) {
    console.error('Get Game Error:', error);
    throw error;
  }
};

export const startGame = async (roomCode, userId) => {
  try {
    // Endpoint does not require query params; if needed, send JSON
    const res = await axios.post(`${API_URL}/games/${roomCode}/start`, {
      user_id: userId
    });
    return res.data;
  } catch (error) {
    console.error('Start Game Error:', error);
    throw error;
  }
};

export const deleteGame = async (roomCode, userId) => {
  try {
    // Use config with data for axios.delete to send body if required
    const res = await axios.delete(`${API_URL}/games/${roomCode}`, {
      data: { user_id: userId }
    });
    return res.data;
  } catch (error) {
    console.error('Delete Game Error:', error);
    throw error;
  }
};
