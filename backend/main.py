from contextlib import asynccontextmanager
from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv
import os
from pathlib import Path

from src.core.config import settings
from src.core.database import create_tables
from src.api.v1.router import api_v1_router

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Application starting...")
    create_tables()
    yield
    print("🛑 Application shutting down...")


app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    lifespan=lifespan
)

app.include_router(api_v1_router, prefix="/api/v1")



if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
