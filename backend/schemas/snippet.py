"""
Code snippet schemas for request/response validation
"""
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class SnippetCreate(BaseModel):
    """Schema for creating a new snippet"""
    code: str
    language: str


class SnippetResponse(BaseModel):
    """Schema for snippet response from Snippet model"""
    id: int
    code: str
    language_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
