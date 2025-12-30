from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from src.core.database import Base


class Publisher(Base):
    __tablename__ = "publishers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    address = Column(String(255), nullable=True)
    contact = Column(String(255), nullable=True)

    # Relationships
    books = relationship("Book", back_populates="publisher", cascade="all, delete-orphan")
