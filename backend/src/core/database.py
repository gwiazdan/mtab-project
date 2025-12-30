from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from typing import Generator
from pathlib import Path

# Get root directory (backend -> src -> core -> root)
BASE_DIR = Path(__file__).parent.parent.parent.parent
DB_DIR = BASE_DIR / "db"

# Create database URL pointing to root/db/bookstore.db
DATABASE_URL = f"sqlite:///{DB_DIR / 'bookstore.db'}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator:
    """Dependency injection for database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables in the database"""
    # Ensure db folder exists in root
    DB_DIR.mkdir(exist_ok=True)
    Base.metadata.create_all(bind=engine)
