from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from src.core.database import Base


class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    bio = Column(Text, nullable=True)

    # Relationships
    books = relationship("Book", secondary="book_author", back_populates="authors")
