"""API v1 router - combines all v1 endpoints"""
from fastapi import APIRouter
from src.api.v1.endpoints import (
    health_router,
    authors_router,
    genres_router,
    publishers_router,
    books_router,
    orders_router,
)
api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(authors_router)
api_v1_router.include_router(genres_router)
api_v1_router.include_router(publishers_router)
api_v1_router.include_router(books_router)
api_v1_router.include_router(orders_router)

__all__ = ["api_v1_router"]
