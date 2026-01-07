"""Book schemas"""
from pydantic import BaseModel, Field, ConfigDict


class BookCreate(BaseModel):
    """Book creation schema"""
    title: str
    description: str | None = None
    price: float = Field(gt=0)
    stock: int = Field(ge=0, default=0)
    isbn: str | None = None
    published_year: int | None = None
    publisher_id: int
    author_ids: list[int] = Field(default_factory=list)
    genre_ids: list[int] = Field(default_factory=list)


class BookResponse(BaseModel):
    """Book response schema"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    price: float
    stock: int
    isbn: str | None = None
    published_year: int | None = None
    publisher_id: int
