from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from src.core.database import Base

book_author = Table(
    "book_author",
    Base.metadata,
    Column("book_id", Integer, ForeignKey("books.id"), primary_key=True),
    Column("author_id", Integer, ForeignKey("authors.id"), primary_key=True),
)

book_genre = Table(
    "book_genre",
    Base.metadata,
    Column("book_id", Integer, ForeignKey("books.id"), primary_key=True),
    Column("genre_id", Integer, ForeignKey("genres.id"), primary_key=True),
)


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    isbn = Column(String(20), unique=True, nullable=True, index=True)
    published_year = Column(Integer, nullable=True)
    publisher_id = Column(Integer, ForeignKey("publishers.id"), nullable=False)

    publisher = relationship("Publisher", back_populates="books")
    authors = relationship("Author", secondary=book_author, back_populates="books")
    genres = relationship("Genre", secondary=book_genre, back_populates="books")
    order_items = relationship("OrderItem", back_populates="book", cascade="all, delete-orphan")
