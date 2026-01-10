from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from typing import Generator
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent.parent
DB_DIR = BASE_DIR / "db"

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
    DB_DIR.mkdir(exist_ok=True)

    # Import all models BEFORE creating tables to register them with Base
    from src.models.admin import Admin

    Base.metadata.create_all(bind=engine)

    # Create default admin user if not exists
    db = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.username == "admin").first()
        if not admin:
            admin = Admin(
                username="admin",
                requires_password_change=True
            )
            admin.set_password("admin")
            db.add(admin)
            db.commit()
            print("✅ Default admin user created (u:admin p:admin)")
    finally:
        db.close()
