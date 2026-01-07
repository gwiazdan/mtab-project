"""Publisher schemas"""
from pydantic import BaseModel, ConfigDict


class PublisherCreate(BaseModel):
    """Publisher creation schema"""
    name: str
    address: str | None = None
    contact: str | None = None


class PublisherResponse(BaseModel):
    """Publisher response schema"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    address: str | None = None
    contact: str | None = None
