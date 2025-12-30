"""Publisher schemas"""
from pydantic import BaseModel


class PublisherCreate(BaseModel):
    """Publisher creation schema"""
    name: str
    address: str | None = None
    contact: str | None = None


class PublisherResponse(BaseModel):
    """Publisher response schema"""
    id: int
    name: str
    address: str | None = None
    contact: str | None = None

    class Config:
        from_attributes = True
