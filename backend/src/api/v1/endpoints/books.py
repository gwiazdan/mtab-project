"""Books endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models import Book, Author, Genre, Publisher
from src.schemas.book import BookCreate, BookResponse

router = APIRouter(prefix="/books", tags=["books"])


@router.get("/", response_model=list[BookResponse])
async def list_books(db: Session = Depends(get_db)):
    """Get all books"""
    books = db.query(Book).all()
    return books


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

