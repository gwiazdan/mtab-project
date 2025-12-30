"""Authors endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models import Author
from src.schemas.author import AuthorCreate, AuthorResponse

router = APIRouter(prefix="/authors", tags=["authors"])


@router.get("/", response_model=list[AuthorResponse])
async def list_authors(db: Session = Depends(get_db)):
    """Get all authors"""
    authors = db.query(Author).all()
    return authors


@router.get("/{author_id}", response_model=AuthorResponse)
async def get_author(author_id: int, db: Session = Depends(get_db)):
    """Get author by ID"""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author


@router.post("/", response_model=AuthorResponse, status_code=201)
async def create_author(author: AuthorCreate, db: Session = Depends(get_db)):
    """Create a new author"""
    db_author = Author(name=author.name, bio=author.bio)
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author
