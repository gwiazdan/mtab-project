"""Books endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models import Book, Author, Genre, Publisher
from src.schemas.book import BookCreate, BookResponse
from src.schemas.author import AuthorResponse
from src.schemas.genre import GenreResponse
from src.schemas.publisher import PublisherResponse
from pydantic import BaseModel

router = APIRouter(prefix="/books", tags=["books"])


class PaginatedResponse(BaseModel):
    """Paginated response schema"""
    items: list[BookResponse]
    total: int
    page: int
    limit: int
    pages: int


class BulkDeleteRequest(BaseModel):
    """Bulk delete schema"""
    book_ids: list[int]


class BooksMetadataResponse(BaseModel):
    """Books with metadata response schema"""
    books: PaginatedResponse
    authors: list[AuthorResponse]
    genres: list[GenreResponse]
    publishers: list[PublisherResponse]


@router.get("/metadata", response_model=BooksMetadataResponse)
async def get_books_metadata(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all books with all metadata in one request (admin panel - no stock filter)"""
    # Get paginated books - NO stock filter for admin panel
    query = db.query(Book)
    total = query.count()
    offset = (page - 1) * limit
    books = query.offset(offset).limit(limit).all()
    pages = (total + limit - 1) // limit

    books_response = {
        "items": books,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }

    # Get all metadata
    authors = db.query(Author).all()
    genres = db.query(Genre).all()
    publishers = db.query(Publisher).all()

    return {
        "books": books_response,
        "authors": authors,
        "genres": genres,
        "publishers": publishers
    }


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


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(book_id: int, book: BookCreate, db: Session = Depends(get_db)):
    """Update a book with relationships"""
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")

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

    # Update book fields
    db_book.title = book.title
    db_book.description = book.description
    db_book.price = book.price
    db_book.stock = book.stock
    db_book.isbn = book.isbn
    db_book.published_year = book.published_year
    db_book.publisher_id = book.publisher_id

    # Update relationships
    db_book.authors.clear()
    db_book.genres.clear()
    for author in authors:
        db_book.authors.append(author)
    for genre in genres:
        db_book.genres.append(genre)

    db.commit()
    db.refresh(db_book)
    return db_book



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


@router.delete("/bulk-delete", response_model=dict)
async def bulk_delete(data: BulkDeleteRequest, db: Session = Depends(get_db)):
    """Delete multiple books"""
    if not data.book_ids:
        raise HTTPException(status_code=400, detail="No book IDs provided")

    # Delete books (cascade will delete relationships)
    deleted_count = db.query(Book).filter(Book.id.in_(data.book_ids)).delete(
        synchronize_session=False
    )
    db.commit()

    return {"deleted": deleted_count}
