"""
Integration tests for code snippets endpoints.
"""
import pytest
from fastapi import status
from backend.models import Language, Snippet


def test_get_available_languages_empty(client, db_session):
    """Test getting languages when database is empty."""
    response = client.get("/snippets")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "languages" in data
    assert data["languages"] == []


def test_get_available_languages_with_data(client, db_session):
    """Test getting languages when data exists."""
    # Add test languages
    python_lang = Language(name="python")
    javascript_lang = Language(name="javascript")
    db_session.add(python_lang)
    db_session.add(javascript_lang)
    db_session.commit()
    
    response = client.get("/snippets")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "languages" in data
    assert "python" in data["languages"]
    assert "javascript" in data["languages"]


def test_get_random_snippet_language_not_found(client, db_session):
    """Test getting snippet for non-existent language."""
    response = client.get("/snippets/nonexistent")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    # New service returns generic message for missing language or snippets
    assert "no snippets" in response.json()["detail"].lower()


def test_get_random_snippet_no_snippets_available(client, db_session):
    """Test getting snippet when language exists but has no snippets."""
    # Add language without snippets
    python_lang = Language(name="python")
    db_session.add(python_lang)
    db_session.commit()
    
    response = client.get("/snippets/python")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "No snippets available" in response.json()["detail"]


def test_get_random_snippet_success(client, db_session):
    """Test successfully getting a random snippet."""
    # Add language and snippet
    python_lang = Language(name="python")
    db_session.add(python_lang)
    db_session.commit()
    
    snippet = Snippet(
        code="print('Hello, World!')",
        language_id=python_lang.id
    )
    db_session.add(snippet)
    db_session.commit()
    
    response = client.get("/snippets/python")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "id" in data
    assert "code" in data
    assert "language" in data
    assert data["code"] == "print('Hello, World!')"
    assert data["language"] == "python"


def test_get_random_snippet_case_insensitive(client, db_session):
    """Test that language lookup is case-insensitive."""
    # Add language in lowercase
    python_lang = Language(name="python")
    db_session.add(python_lang)
    db_session.commit()
    
    snippet = Snippet(
        code="x = 42",
        language_id=python_lang.id
    )
    db_session.add(snippet)
    db_session.commit()
    
    # Try with uppercase
    response = client.get("/snippets/PYTHON")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["language"] == "python"
