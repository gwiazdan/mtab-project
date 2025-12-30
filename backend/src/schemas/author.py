"""Author schemas"""
from pydantic import BaseModel


class AuthorCreate(BaseModel):
    """Author creation schema"""
    name: str
    bio: str | None = None


class AuthorResponse(BaseModel):
    """Author response schema"""
    id: int
    name: str
    bio: str | None = None

    class Config:
        from_attributes = True
