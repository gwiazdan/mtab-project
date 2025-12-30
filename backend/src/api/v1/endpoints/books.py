"""Books endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models import Book

router = APIRouter(prefix="/books", tags=["books"])


@router.get("/")
async def list_books(db: Session = Depends(get_db)):
    """Get all books"""
    books = db.query(Book).all()
    return books


@router.get("/{book_id}")
async def get_book(book_id: int, db: Session = Depends(get_db)):
    """Get book by ID with relationships"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book
