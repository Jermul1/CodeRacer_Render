"""
Snippet repository for code snippet database operations
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Snippet, Language
from .base import BaseRepository


class SnippetRepository(BaseRepository[Snippet]):
    """Repository for Snippet model with custom queries"""
    
    def __init__(self, db: Session):
        super().__init__(Snippet, db)
    
    def get_random(self) -> Optional[Snippet]:
        """Get a random code snippet"""
        return self.db.query(Snippet).order_by(func.random()).first()
    
    def get_random_by_language(self, language_name: str) -> Optional[Snippet]:
        """Get a random snippet for a specific language name"""
        lang = self.db.query(Language).filter(Language.name == language_name.lower()).first()
        if not lang:
            return None
        return self.db.query(Snippet).filter(Snippet.language_id == lang.id).order_by(func.random()).first()

    def get_by_language(self, language_name: str, skip: int = 0, limit: int = 100) -> List[Snippet]:
        """Get snippets filtered by programming language name"""
        lang = self.db.query(Language).filter(Language.name == language_name.lower()).first()
        if not lang:
            return []
        return self.db.query(Snippet).filter(Snippet.language_id == lang.id).offset(skip).limit(limit).all()

    def get_all_languages(self) -> List[str]:
        """Return all language names"""
        languages = self.db.query(Language).all()
        return [l.name for l in languages]
