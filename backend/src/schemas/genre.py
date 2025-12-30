"""Genre schemas"""
from pydantic import BaseModel


class GenreCreate(BaseModel):
    """Genre creation schema"""
    name: str
    description: str | None = None


class GenreResponse(BaseModel):
    """Genre response schema"""
    id: int
    name: str
    description: str | None = None

    class Config:
        from_attributes = True
