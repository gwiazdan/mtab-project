from contextlib import asynccontextmanager
from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Application starting...")
    yield
    print("🛑 Application shutting down...")


app = FastAPI(
    title="Bookstore API",
    description="Bookstore API for MTAB Project",
    version="0.0.1",
    lifespan=lifespan
)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
