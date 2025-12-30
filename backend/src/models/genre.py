from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from src.core.database import Base


class Genre(Base):
    __tablename__ = "genres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Relationships
    books = relationship("Book", secondary="book_genre", back_populates="genres")
