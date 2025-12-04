-- CodeRacer Database Schema
-- This file creates the database structure for the CodeRacer application
-- Run this to manually set up the database (optional - app auto-creates on startup)

-- Create database (uncomment if needed)
-- CREATE DATABASE coderacer;

-- Connect to the database
-- \c coderacer

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- Languages table
CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_languages_id ON languages(id);

-- Snippets table
CREATE TABLE IF NOT EXISTS snippets (
    id SERIAL PRIMARY KEY,
    language_id INTEGER NOT NULL REFERENCES languages(id),
    code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_snippets_id ON snippets(id);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    snippet_id INTEGER NOT NULL REFERENCES snippets(id),
    wpm NUMERIC,
    accuracy NUMERIC,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_id ON scores(id);

-- Passages table (optional)
CREATE TABLE IF NOT EXISTS passages (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_passages_id ON passages(id);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) UNIQUE NOT NULL,
    host_user_id INTEGER NOT NULL REFERENCES users(id),
    snippet_id INTEGER NOT NULL REFERENCES snippets(id),
    status VARCHAR(20) DEFAULT 'waiting',
    max_players INTEGER DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_games_id ON games(id);
CREATE INDEX IF NOT EXISTS idx_games_room_code ON games(room_code);

-- Game Participants table
CREATE TABLE IF NOT EXISTS game_participants (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    username VARCHAR(50) NOT NULL,
    progress INTEGER DEFAULT 0,
    wpm DOUBLE PRECISION DEFAULT 0.0,
    accuracy DOUBLE PRECISION DEFAULT 0.0,
    is_finished BOOLEAN DEFAULT FALSE,
    finish_position INTEGER,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_participants_id ON game_participants(id);

-- Comments for documentation
COMMENT ON TABLE users IS 'Registered users of the application';
COMMENT ON TABLE languages IS 'Programming languages available for code snippets';
COMMENT ON TABLE snippets IS 'Code snippets used in typing races';
COMMENT ON TABLE scores IS 'Individual user scores for completed typing races';
COMMENT ON TABLE games IS 'Multiplayer game sessions';
COMMENT ON TABLE game_participants IS 'Players participating in multiplayer games';