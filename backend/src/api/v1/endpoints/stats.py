"""Stats endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models import Book, Order, Author, Genre, Publisher
from pydantic import BaseModel

router = APIRouter(prefix="/stats", tags=["stats"])


class StatsResponse(BaseModel):
    """Stats response schema"""
    total_books: int
    total_orders: int
    total_authors: int
    total_genres: int
    total_publishers: int
    total_revenue: float


@router.get("/", response_model=StatsResponse)
async def get_stats(db: Session = Depends(get_db)):
    """Get all dashboard stats"""
    total_books = db.query(Book).count()
    total_orders = db.query(Order).count()
    total_authors = db.query(Author).count()
    total_genres = db.query(Genre).count()
    total_publishers = db.query(Publisher).count()

    # Calculate total revenue from all orders
    orders = db.query(Order).all()
    total_revenue = sum(order.total_price for order in orders) if orders else 0.0

    return {
        "total_books": total_books,
        "total_orders": total_orders,
        "total_authors": total_authors,
        "total_genres": total_genres,
        "total_publishers": total_publishers,
        "total_revenue": total_revenue,
    }
