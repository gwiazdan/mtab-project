"""Health check and info endpoints"""
from fastapi import APIRouter
from src.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Health check endpoint - returns 200 if API is running"""
    return {"status": "ok"}


@router.get("/info")
async def api_info():
    """Get API information"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "description": settings.app_description
    }
