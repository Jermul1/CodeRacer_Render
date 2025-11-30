from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Snippet, Language

# Change the router prefix to /snippets instead of /auth
router = APIRouter(prefix="/snippets", tags=["snippets"])

@router.get("/{language}")
def get_random_snippet(language: str, db: Session = Depends(get_db)):
    # Get the language ID
    lang = db.query(Language).filter(Language.name == language.lower()).first()
    if not lang:
        raise HTTPException(status_code=404, detail="Language not found")

    # Get a random snippet for the selected language
    snippet = db.query(Snippet)\
        .filter(Snippet.language_id == lang.id)\
        .order_by(func.random())\
        .first()

    if not snippet:
        raise HTTPException(
            status_code=404, 
            detail=f"No snippets available for {language}"
        )

    return {
        "id": snippet.id,
        "code": snippet.code,
        "language": lang.name
    }

@router.get("/")
def get_available_languages(db: Session = Depends(get_db)):
    languages = db.query(Language).all()
    return {
        "languages": [lang.name for lang in languages]
    }