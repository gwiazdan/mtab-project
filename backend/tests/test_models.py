"""Test cases for SQLAlchemy models and relationships"""
import pytest
from src.models import Author, Publisher, Genre, Book, Order, OrderItem


class TestPublisher:
    """Test Publisher model"""

    def test_create_publisher(self, test_db):
        """Test creating a publisher"""
        pub = Publisher(name="Penguin Books", address="London", contact="info@penguin.com")
        test_db.add(pub)
        test_db.commit()

        assert pub.id is not None
        assert pub.name == "Penguin Books"
        assert pub.address == "London"

    def test_publisher_has_books(self, test_db):
        """Test publisher has books relationship"""
        pub = Publisher(name="Penguin Books")
        test_db.add(pub)
        test_db.flush()

        book = Book(
            title="Test Book",
            price=19.99,
            stock=10,
            publisher_id=pub.id
        )
        test_db.add(book)
        test_db.commit()

        assert len(pub.books) == 1
        assert pub.books[0].title == "Test Book"


class TestAuthor:
    """Test Author model"""

    def test_create_author(self, test_db):
        """Test creating an author"""
        author = Author(name="J.K. Rowling", bio="British author")
        test_db.add(author)
        test_db.commit()

        assert author.id is not None
        assert author.name == "J.K. Rowling"
        assert author.bio == "British author"


class TestGenre:
    """Test Genre model"""

    def test_create_genre(self, test_db):
        """Test creating a genre"""
        genre = Genre(name="Fantasy", description="Fantasy novels")
        test_db.add(genre)
        test_db.commit()

        assert genre.id is not None
        assert genre.name == "Fantasy"


class TestBook:
    """Test Book model and relationships"""

    def test_create_book(self, test_db):
        """Test creating a book"""
        pub = Publisher(name="Test Publisher")
        test_db.add(pub)
        test_db.flush()

        book = Book(
            title="Test Book",
            description="A test book",
            price=19.99,
            stock=100,
            isbn="978-0000000000",
            published_year=2023,
            publisher_id=pub.id
        )
        test_db.add(book)
        test_db.commit()

        assert book.id is not None
        assert book.title == "Test Book"
        assert book.publisher.name == "Test Publisher"

    def test_book_with_authors(self, test_db):
        """Test book many-to-many relationship with authors"""
        pub = Publisher(name="Test Publisher")
        author1 = Author(name="Author 1")
        author2 = Author(name="Author 2")
        test_db.add_all([pub, author1, author2])
        test_db.flush()

        book = Book(
            title="Test Book",
            price=19.99,
            stock=10,
            publisher_id=pub.id
        )
        book.authors.append(author1)
        book.authors.append(author2)
        test_db.add(book)
        test_db.commit()

        assert len(book.authors) == 2
        assert author1 in book.authors
        assert author2 in book.authors

    def test_book_with_genres(self, test_db):
        """Test book many-to-many relationship with genres"""
        pub = Publisher(name="Test Publisher")
        genre1 = Genre(name="Fantasy")
        genre2 = Genre(name="Adventure")
        test_db.add_all([pub, genre1, genre2])
        test_db.flush()

        book = Book(
            title="Test Book",
            price=19.99,
            stock=10,
            publisher_id=pub.id
        )
        book.genres.append(genre1)
        book.genres.append(genre2)
        test_db.add(book)
        test_db.commit()

        assert len(book.genres) == 2
        assert genre1 in book.genres
        assert genre2 in book.genres

    def test_book_with_authors_and_genres(self, test_db):
        """Test book with both authors and genres"""
        pub = Publisher(name="Test Publisher")
        author = Author(name="Test Author")
        genre = Genre(name="Fantasy")
        test_db.add_all([pub, author, genre])
        test_db.flush()

        book = Book(
            title="Test Book",
            price=19.99,
            stock=10,
            publisher_id=pub.id
        )
        book.authors.append(author)
        book.genres.append(genre)
        test_db.add(book)
        test_db.commit()

        queried_book = test_db.query(Book).filter(Book.title == "Test Book").first()
        assert queried_book.title == "Test Book"
        assert len(queried_book.authors) == 1
        assert len(queried_book.genres) == 1
        assert queried_book.publisher.name == "Test Publisher"


class TestOrder:
    """Test Order model and relationships"""

    def test_create_order(self, test_db):
        """Test creating an order"""
        order = Order(
            customer_name="John Doe",
            email="john@example.com",
            phone="123456789",
            status="pending",
            total_price=39.98
        )
        test_db.add(order)
        test_db.commit()

        assert order.id is not None
        assert order.customer_name == "John Doe"
        assert order.status == "pending"

    def test_order_with_items(self, test_db):
        """Test order with order items"""
        pub = Publisher(name="Test Publisher")
        book = Book(
            title="Test Book",
            price=19.99,
            stock=100,
            publisher_id=None  # Will set after pub
        )
        test_db.add(pub)
        test_db.flush()
        book.publisher_id = pub.id

        order = Order(
            customer_name="John Doe",
            email="john@example.com",
            total_price=39.98
        )
        test_db.add_all([book, order])
        test_db.flush()

        item = OrderItem(
            order_id=order.id,
            book_id=book.id,
            quantity=2,
            price_at_purchase=19.99
        )
        test_db.add(item)
        test_db.commit()

        queried_order = test_db.query(Order).first()
        assert len(queried_order.items) == 1
        assert queried_order.items[0].book.title == "Test Book"
        assert queried_order.items[0].quantity == 2

    def test_order_cascade_delete(self, test_db):
        """Test that deleting order deletes order items"""
        pub = Publisher(name="Test Publisher")
        book = Book(
            title="Test Book",
            price=19.99,
            stock=100,
            publisher_id=None
        )
        test_db.add(pub)
        test_db.flush()
        book.publisher_id = pub.id

        order = Order(
            customer_name="John Doe",
            email="john@example.com",
            total_price=39.98
        )
        test_db.add_all([book, order])
        test_db.flush()

        item = OrderItem(
            order_id=order.id,
            book_id=book.id,
            quantity=2,
            price_at_purchase=19.99
        )
        test_db.add(item)
        test_db.commit()

        # Delete order
        test_db.delete(order)
        test_db.commit()

        # Check that order items are deleted
        remaining_items = test_db.query(OrderItem).all()
        assert len(remaining_items) == 0
