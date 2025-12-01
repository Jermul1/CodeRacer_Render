import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const normalizeApiError = (error, fallback = "Request failed") => {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    // Pydantic validation array
    return detail.map(d => d.msg).join("; ");
  }
  if (detail && typeof detail === "object") {
    return detail.msg || JSON.stringify(detail);
  }
  if (typeof detail === "string") return detail;
  if (error?.message) return error.message;
  return fallback;
};

export const getRandomSnippet = async (language = 'python') => {
  try {
    const res = await axios.get(`${API_URL}/snippets/${language}`);
    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error, "Failed to fetch snippet"));
  }
};

export const getAvailableLanguages = async () => {
  try {
    const res = await axios.get(`${API_URL}/snippets`);
    return res.data.languages;
  } catch (error) {
    throw new Error(normalizeApiError(error, "Failed to fetch languages"));
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
    throw new Error(normalizeApiError(error, "Signup failed"));
  }
};

export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error, "Login failed"));
  }
};

export const createGame = async (userId, snippetId = null, maxPlayers = 4, language = null) => {
  try {
    const res = await axios.post(`${API_URL}/games/create`, {
      user_id: userId,
      snippet_id: snippetId,
      max_players: maxPlayers,
      language: language
    });
    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error, "Create game failed"));
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
    throw new Error(normalizeApiError(error, "Join game failed"));
  }
};

export const getGame = async (roomCode) => {
  try {
    const res = await axios.get(`${API_URL}/games/${roomCode}`);
    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error, "Get game failed"));
  }
};

export const startGame = async (roomCode, userId) => {
  try {
    const res = await axios.post(`${API_URL}/games/${roomCode}/start`, {
      user_id: userId
    });
    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error, "Start game failed"));
  }
};

export const deleteGame = async (roomCode, userId) => {
  try {
    const res = await axios.delete(`${API_URL}/games/${roomCode}`, {
      data: { user_id: userId }
    });
    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error, "Delete game failed"));
  }
};
