"""Books endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models import Book, Author, Genre, Publisher
from src.schemas.book import BookCreate, BookResponse
from pydantic import BaseModel

router = APIRouter(prefix="/books", tags=["books"])


class PaginatedResponse(BaseModel):
    """Paginated response schema"""
    items: list[BookResponse]
    total: int
    page: int
    limit: int
    pages: int


@router.get("/", response_model=PaginatedResponse)
async def list_books(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all books with stock > 0, paginated"""
    # Query books with stock > 0
    query = db.query(Book).filter(Book.stock > 0)

    # Get total count
    total = query.count()

    # Calculate pagination
    offset = (page - 1) * limit
    books = query.offset(offset).limit(limit).all()

    # Calculate total pages
    pages = (total + limit - 1) // limit

    return {
        "items": books,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(book_id: int, db: Session = Depends(get_db)):
    """Get book by ID with relationships"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("/", response_model=BookResponse, status_code=201)
async def create_book(book: BookCreate, db: Session = Depends(get_db)):
    """Create a new book with relationships"""

    publisher = db.query(Publisher).filter(Publisher.id == book.publisher_id).first()
    if not publisher:
        raise HTTPException(status_code=404, detail="Publisher not found")

    if book.author_ids:
        authors = db.query(Author).filter(Author.id.in_(book.author_ids)).all()
        if len(authors) != len(book.author_ids):
            raise HTTPException(status_code=404, detail="One or more authors not found")
    else:
        authors = []

    if book.genre_ids:
        genres = db.query(Genre).filter(Genre.id.in_(book.genre_ids)).all()
        if len(genres) != len(book.genre_ids):
            raise HTTPException(status_code=404, detail="One or more genres not found")
    else:
        genres = []

    db_book = Book(
        title=book.title,
        description=book.description,
        price=book.price,
        stock=book.stock,
        isbn=book.isbn,
        published_year=book.published_year,
        publisher_id=book.publisher_id
    )

    for author in authors:
        db_book.authors.append(author)
    for genre in genres:
        db_book.genres.append(genre)

    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

