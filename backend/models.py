from sqlalchemy import Column, Integer, String, Text, ForeignKey, Numeric, TIMESTAMP, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base  # .database jostain syystä

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    scores = relationship("Score", back_populates="user")
    game_participants = relationship("GameParticipant", back_populates="user")


class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    snippets = relationship("Snippet", back_populates="language")


class Snippet(Base):
    __tablename__ = "snippets"

    id = Column(Integer, primary_key=True, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"))
    code = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    language = relationship("Language", back_populates="snippets")
    scores = relationship("Score", back_populates="snippet")


class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    snippet_id = Column(Integer, ForeignKey("snippets.id"))
    wpm = Column(Numeric)
    accuracy = Column(Numeric)
    completed_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="scores")
    snippet = relationship("Snippet", back_populates="scores")


# Optional passages table used by your endpoints
class Passage(Base):
    __tablename__ = "passages"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    room_code = Column(String(10), unique=True, nullable=False, index=True)
    host_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    snippet_id = Column(Integer, ForeignKey("snippets.id"), nullable=False)
    status = Column(String(20), default="waiting")  # waiting, in_progress, finished
    max_players = Column(Integer, default=4)
    created_at = Column(TIMESTAMP, server_default=func.now())
    started_at = Column(TIMESTAMP, nullable=True)
    finished_at = Column(TIMESTAMP, nullable=True)

    snippet = relationship("Snippet")
    participants = relationship("GameParticipant", back_populates="game")


class GameParticipant(Base):
    __tablename__ = "game_participants"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    username = Column(String(50), nullable=False)  # Denormalized for quick access
    progress = Column(Integer, default=0)  # Characters typed correctly
    wpm = Column(Float, default=0.0)
    accuracy = Column(Float, default=0.0)
    is_finished = Column(Boolean, default=False)
    finish_position = Column(Integer, nullable=True)
    joined_at = Column(TIMESTAMP, server_default=func.now())
    finished_at = Column(TIMESTAMP, nullable=True)

    game = relationship("Game", back_populates="participants")
    user = relationship("User", back_populates="game_participants")
