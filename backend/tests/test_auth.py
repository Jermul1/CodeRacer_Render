"""
Unit tests for authentication endpoints.
"""
import pytest
from fastapi import status


def test_signup_success(client, db_session):
    """Test successful user registration."""
    response = client.post(
        "/auth/signup",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepassword123"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["message"] == "User created successfully"
    assert "id" in data


def test_signup_duplicate_email(client, db_session):
    """Test that duplicate email registration fails."""
    # First signup
    client.post(
        "/auth/signup",
        json={
            "username": "testuser1",
            "email": "duplicate@example.com",
            "password": "password123"
        }
    )
    
    # Try to signup again with same email
    response = client.post(
        "/auth/signup",
        json={
            "username": "testuser2",
            "email": "duplicate@example.com",
            "password": "password456"
        }
    )
    
    # Should return 400 Bad Request
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already" in response.json()["detail"].lower()


def test_signup_duplicate_username(client, db_session):
    """Test that duplicate username registration fails."""
    # First signup
    client.post(
        "/auth/signup",
        json={
            "username": "duplicateuser",
            "email": "user1@example.com",
            "password": "password123"
        }
    )
    
    # Try to signup again with same username
    response = client.post(
        "/auth/signup",
        json={
            "username": "duplicateuser",
            "email": "user2@example.com",
            "password": "password456"
        }
    )
    
    # Should return 400 Bad Request
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "username" in response.json()["detail"].lower() or "already" in response.json()["detail"].lower()


def test_login_success(client, db_session):
    """Test successful login."""
    # First create a user
    signup_response = client.post(
        "/auth/signup",
        json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "mypassword123"
        }
    )
    assert signup_response.status_code == status.HTTP_200_OK
    
    # Now try to login
    response = client.post(
        "/auth/login",
        json={
            "email": "login@example.com",
            "password": "mypassword123"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["message"] == "Login successful"
    assert "user_id" in data


def test_login_invalid_credentials(client, db_session):
    """Test login with invalid credentials."""
    response = client.post(
        "/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid credentials" in response.json()["detail"]


def test_login_wrong_password(client, db_session):
    """Test login with correct email but wrong password."""
    # Create a user
    client.post(
        "/auth/signup",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "correctpassword"
        }
    )
    
    # Try to login with wrong password
    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
