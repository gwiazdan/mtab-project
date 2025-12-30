"""Genres endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models import Genre
from src.schemas.genre import GenreCreate, GenreResponse

router = APIRouter(prefix="/genres", tags=["genres"])


@router.get("/", response_model=list[GenreResponse])
async def list_genres(db: Session = Depends(get_db)):
    """Get all genres"""
    genres = db.query(Genre).all()
    return genres


@router.get("/{genre_id}", response_model=GenreResponse)
async def get_genre(genre_id: int, db: Session = Depends(get_db)):
    """Get genre by ID"""
    genre = db.query(Genre).filter(Genre.id == genre_id).first()
    if not genre:
        raise HTTPException(status_code=404, detail="Genre not found")
    return genre


@router.post("/", response_model=GenreResponse, status_code=201)
async def create_genre(genre: GenreCreate, db: Session = Depends(get_db)):
    """Create a new genre"""
    db_genre = Genre(name=genre.name, description=genre.description)
    db.add(db_genre)
    db.commit()
    db.refresh(db_genre)
    return db_genre
