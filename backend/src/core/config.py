"""Application configuration"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    app_name: str = "Bookstore API"
    app_version: str = "0.0.1"
    app_description: str = "Bookstore API for MTAB Project"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
