
-- ChatGPT esimerkki tietokannasta
-- ==================================================
-- Typerace Game Database Schema
-- ==================================================

-- Drop existing tables if you want to reset (optional)
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS snippets CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================
-- USERS TABLE
-- ==========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- LANGUAGES TABLE
-- ==========================
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- ==========================
-- SNIPPETS TABLE
-- ==========================
CREATE TABLE snippets (
    id SERIAL PRIMARY KEY,
    language_id INT NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- SCORES TABLE
-- ==========================
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snippet_id INT NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
    wpm NUMERIC,
    accuracy NUMERIC,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
