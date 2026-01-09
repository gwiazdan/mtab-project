"""Book schemas"""
from pydantic import BaseModel, Field, ConfigDict


class AuthorResponse(BaseModel):
    """Author response schema"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class GenreResponse(BaseModel):
    """Genre response schema"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class PublisherResponse(BaseModel):
    """Publisher response schema"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


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
    authors: list[AuthorResponse] = Field(default_factory=list)
    genres: list[GenreResponse] = Field(default_factory=list)
    publisher: PublisherResponse | None = None
