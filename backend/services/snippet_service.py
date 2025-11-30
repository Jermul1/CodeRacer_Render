"""
Snippet service for code snippet management
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models import Snippet, Language
from ..repositories.snippet_repository import SnippetRepository
from ..schemas.snippet import SnippetCreate, SnippetResponse
from typing import List


class SnippetService:
    """Service layer for code snippet business logic"""
    
    def __init__(self, db: Session):
        self.db = db
        self.snippet_repo = SnippetRepository(db)
    
    def get_all_snippets(self, skip: int = 0, limit: int = 100) -> List[SnippetResponse]:
        """
        Get all code snippets
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of code snippets
        """
        snippets = self.snippet_repo.get_all(skip=skip, limit=limit)
        return [SnippetResponse.model_validate(s) for s in snippets]
    
    def get_snippet(self, snippet_id: int) -> SnippetResponse:
        """
        Get a specific code snippet
        
        Args:
            snippet_id: Snippet ID
            
        Returns:
            Code snippet details
            
        Raises:
            HTTPException: If snippet not found
        """
        snippet = self.snippet_repo.get_by_id(snippet_id)
        if not snippet:
            raise HTTPException(status_code=404, detail="Snippet not found")
        return SnippetResponse.model_validate(snippet)
    
    def get_random_snippet(self) -> SnippetResponse:
        """
        Get a random code snippet
        
        Returns:
            Random code snippet
            
        Raises:
            HTTPException: If no snippets available
        """
        snippet = self.snippet_repo.get_random()
        if not snippet:
            raise HTTPException(status_code=404, detail="No snippets available")
        return SnippetResponse.model_validate(snippet)

    def get_random_snippet_by_language(self, language: str) -> dict:
        """Get a random snippet for a specific language"""
        snippet = self.snippet_repo.get_random_by_language(language)
        if not snippet:
            raise HTTPException(status_code=404, detail=f"No snippets available for {language}")
        return {
            "id": snippet.id,
            "code": snippet.code,
            "language": snippet.language.name if snippet.language else language.lower()
        }

    def get_available_languages(self) -> dict:
        """Get list of all available language names"""
        languages = self.snippet_repo.get_all_languages()
        return {"languages": languages}
    
    def create_snippet(self, snippet_data: SnippetCreate) -> SnippetResponse:
        """
        Create a new code snippet
        
        Args:
            snippet_data: Snippet creation data
            
        Returns:
            Created snippet details
        """
        # Resolve or create language row
        lang = self.db.query(Language).filter(Language.name == snippet_data.language.lower()).first()
        if not lang:
            lang = Language(name=snippet_data.language.lower())
            self.db.add(lang)
            self.db.commit()
            self.db.refresh(lang)

        snippet = Snippet(
            code=snippet_data.code,
            language_id=lang.id
        )
        created_snippet = self.snippet_repo.create(snippet)
        return SnippetResponse.model_validate(created_snippet)
