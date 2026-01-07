"""Author schemas"""
from pydantic import BaseModel, ConfigDict


class AuthorCreate(BaseModel):
    """Author creation schema"""
    name: str
    bio: str | None = None


class AuthorResponse(BaseModel):
    """Author response schema"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    bio: str | None = None
