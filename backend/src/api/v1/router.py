"""API v1 router - combines all v1 endpoints"""
from fastapi import APIRouter
from src.api.v1.endpoints.health import router as health_router
from src.api.v1.endpoints.authors import router as authors_router
from src.api.v1.endpoints.genres import router as genres_router
from src.api.v1.endpoints.publishers import router as publishers_router
from src.api.v1.endpoints.books import router as books_router
from src.api.v1.endpoints.orders import router as orders_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(authors_router)
api_v1_router.include_router(genres_router)
api_v1_router.include_router(publishers_router)
api_v1_router.include_router(books_router)
api_v1_router.include_router(orders_router)

__all__ = ["api_v1_router"]
