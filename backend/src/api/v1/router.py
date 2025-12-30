"""API v1 router - combines all v1 endpoints"""
from fastapi import APIRouter
from src.api.v1.endpoints.health import router as health_router

api_v1_router = APIRouter()

# Include all endpoint routers
api_v1_router.include_router(health_router)

__all__ = ["api_v1_router"]
