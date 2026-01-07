"""Genre schemas"""
from pydantic import BaseModel, ConfigDict


class GenreCreate(BaseModel):
    """Genre creation schema"""
    name: str
    description: str | None = None


class GenreResponse(BaseModel):
    """Genre response schema"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
