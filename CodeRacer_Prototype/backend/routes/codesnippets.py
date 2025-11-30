"""
Code snippet routes - thin controllers using SnippetService
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..services.snippet_service import SnippetService
from ..schemas.snippet import SnippetCreate, SnippetResponse

router = APIRouter(prefix="/snippets", tags=["snippets"])


def get_snippet_service(db: Session = Depends(get_db)) -> SnippetService:
    """Dependency injection for SnippetService"""
    return SnippetService(db)


@router.get("/")
def get_available_languages(
    snippet_service: SnippetService = Depends(get_snippet_service)
):
    """Get available programming languages (returns {'languages': [...]})"""
    return snippet_service.get_available_languages()


@router.get("/random", response_model=SnippetResponse)
def get_random_snippet(
    snippet_service: SnippetService = Depends(get_snippet_service)
):
    """Get a random code snippet"""
    return snippet_service.get_random_snippet()

@router.get("/{language}")
def get_random_snippet_by_language(
    language: str,
    snippet_service: SnippetService = Depends(get_snippet_service)
):
    """Get a random snippet for the specified language (compat with old frontend)"""
    return snippet_service.get_random_snippet_by_language(language)

@router.get("/{snippet_id}", response_model=SnippetResponse)
def get_snippet(
    snippet_id: int,
    snippet_service: SnippetService = Depends(get_snippet_service)
):
    """Get a specific code snippet"""
    return snippet_service.get_snippet(snippet_id)


@router.post("/", response_model=SnippetResponse)
def create_snippet(
    payload: SnippetCreate,
    snippet_service: SnippetService = Depends(get_snippet_service)
):
    """Create a new code snippet"""
    return snippet_service.create_snippet(payload)
