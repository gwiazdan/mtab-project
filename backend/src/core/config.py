"""Application configuration"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    app_name: str = "Bookstore API"
    app_version: str = "0.0.1"
    app_description: str = "Bookstore API for MTAB Project"


settings = Settings()
