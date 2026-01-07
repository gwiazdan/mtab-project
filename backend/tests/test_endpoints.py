"""Test cases for API endpoints"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.core.config import settings
from src.core.database import get_db
from src.api.v1.routes.router import api_v1_router


@pytest.fixture
def client(test_db):
    """Create test client with test database."""
    test_app = FastAPI(
        title=settings.app_name,
        description=settings.app_description,
        version=settings.app_version,
    )

    test_app.include_router(api_v1_router, prefix="/api/v1")

    def override_get_db():
        yield test_db

    test_app.dependency_overrides[get_db] = override_get_db

    with TestClient(test_app) as test_client:
        yield test_client

    test_app.dependency_overrides.clear()


class TestHealthEndpoints:
    """Test health check endpoints"""

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_api_info(self, client):
        """Test API info endpoint"""
        response = client.get("/api/v1/info")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "description" in data


class TestAuthorsEndpoints:
    """Test authors endpoints"""

    def test_list_authors_empty(self, client):
        """Test listing authors when empty"""
        response = client.get("/api/v1/authors/")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_author(self, client):
        """Test creating an author"""
        response = client.post(
            "/api/v1/authors/",
            json={"name": "J.K. Rowling", "bio": "British author"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "J.K. Rowling"
        assert data["bio"] == "British author"
        assert data["id"] is not None

    def test_list_authors(self, client):
        """Test listing authors"""
        # Create author
        client.post(
            "/api/v1/authors/",
            json={"name": "J.K. Rowling", "bio": "British author"}
        )

        # List authors
        response = client.get("/api/v1/authors/")
        assert response.status_code == 200
        authors = response.json()
        assert len(authors) == 1
        assert authors[0]["name"] == "J.K. Rowling"

    def test_get_author(self, client):
        """Test getting a specific author"""
        # Create author
        create_response = client.post(
            "/api/v1/authors/",
            json={"name": "J.K. Rowling", "bio": "British author"}
        )
        author_id = create_response.json()["id"]

        # Get author
        response = client.get(f"/api/v1/authors/{author_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "J.K. Rowling"
        assert data["id"] == author_id

    def test_get_author_not_found(self, client):
        """Test getting non-existent author"""
        response = client.get("/api/v1/authors/999")
        assert response.status_code == 404


class TestPublishersEndpoints:
    """Test publishers endpoints"""

    def test_list_publishers_empty(self, client):
        """Test listing publishers when empty"""
        response = client.get("/api/v1/publishers/")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_publisher(self, client):
        """Test creating a publisher"""
        response = client.post(
            "/api/v1/publishers/",
            json={
                "name": "Penguin Books",
                "address": "London",
                "contact": "info@penguin.com"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Penguin Books"
        assert data["address"] == "London"
        assert data["contact"] == "info@penguin.com"

    def test_get_publisher(self, client):
        """Test getting a specific publisher"""
        # Create publisher
        create_response = client.post(
            "/api/v1/publishers/",
            json={
                "name": "Penguin Books",
                "address": "London",
                "contact": "info@penguin.com"
            }
        )
        publisher_id = create_response.json()["id"]

        # Get publisher
        response = client.get(f"/api/v1/publishers/{publisher_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Penguin Books"


class TestGenresEndpoints:
    """Test genres endpoints"""

    def test_list_genres_empty(self, client):
        """Test listing genres when empty"""
        response = client.get("/api/v1/genres/")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_genre(self, client):
        """Test creating a genre"""
        response = client.post(
            "/api/v1/genres/",
            json={"name": "Fantasy", "description": "Fantasy books"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Fantasy"
        assert data["description"] == "Fantasy books"

    def test_get_genre(self, client):
        """Test getting a specific genre"""
        # Create genre
        create_response = client.post(
            "/api/v1/genres/",
            json={"name": "Fantasy", "description": "Fantasy books"}
        )
        genre_id = create_response.json()["id"]

        # Get genre
        response = client.get(f"/api/v1/genres/{genre_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Fantasy"


class TestBooksEndpoints:
    """Test books endpoints"""

    @pytest.fixture
    def publisher_and_author_and_genre(self, client):
        """Create publisher, author, and genre for book tests"""
        pub_response = client.post(
            "/api/v1/publishers/",
            json={
                "name": "Penguin Books",
                "address": "London",
                "contact": "info@penguin.com"
            }
        )
        publisher_id = pub_response.json()["id"]

        author_response = client.post(
            "/api/v1/authors/",
            json={"name": "J.K. Rowling", "bio": "British author"}
        )
        author_id = author_response.json()["id"]

        genre_response = client.post(
            "/api/v1/genres/",
            json={"name": "Fantasy", "description": "Fantasy books"}
        )
        genre_id = genre_response.json()["id"]

        return publisher_id, author_id, genre_id

    def test_list_books_empty(self, client):
        """Test listing books when empty"""
        response = client.get("/api/v1/books/")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_book(self, client, publisher_and_author_and_genre):
        """Test creating a book"""
        publisher_id, author_id, genre_id = publisher_and_author_and_genre

        response = client.post(
            "/api/v1/books/",
            json={
                "title": "Harry Potter",
                "description": "A magical adventure",
                "price": 19.99,
                "stock": 100,
                "isbn": "978-0-7475-3269-9",
                "published_year": 1997,
                "publisher_id": publisher_id,
                "author_ids": [author_id],
                "genre_ids": [genre_id]
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Harry Potter"
        assert data["price"] == 19.99
        assert data["stock"] == 100

    def test_create_book_publisher_not_found(self, client):
        """Test creating book with non-existent publisher"""
        response = client.post(
            "/api/v1/books/",
            json={
                "title": "Harry Potter",
                "description": "A magical adventure",
                "price": 19.99,
                "stock": 100,
                "isbn": "978-0-7475-3269-9",
                "published_year": 1997,
                "publisher_id": 999,
                "author_ids": [],
                "genre_ids": []
            }
        )
        assert response.status_code == 404

    def test_get_book(self, client, publisher_and_author_and_genre):
        """Test getting a specific book"""
        publisher_id, author_id, genre_id = publisher_and_author_and_genre

        # Create book
        create_response = client.post(
            "/api/v1/books/",
            json={
                "title": "Harry Potter",
                "description": "A magical adventure",
                "price": 19.99,
                "stock": 100,
                "isbn": "978-0-7475-3269-9",
                "published_year": 1997,
                "publisher_id": publisher_id,
                "author_ids": [author_id],
                "genre_ids": [genre_id]
            }
        )
        book_id = create_response.json()["id"]

        # Get book
        response = client.get(f"/api/v1/books/{book_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Harry Potter"


class TestOrdersEndpoints:
    """Test orders endpoints"""

    def test_list_orders_empty(self, client):
        """Test listing orders when empty"""
        response = client.get("/api/v1/orders/")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_order(self, client):
        """Test creating an order"""
        response = client.post(
            "/api/v1/orders/",
            json={
                "customer_name": "John Doe",
                "email": "john@example.com",
                "phone": None,
                "status": "pending"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["customer_name"] == "John Doe"
        assert data["email"] == "john@example.com"
        assert data["id"] is not None

    def test_get_order(self, client):
        """Test getting a specific order"""
        # Create order
        create_response = client.post(
            "/api/v1/orders/",
            json={
                "customer_name": "John Doe",
                "email": "john@example.com",
                "phone": None,
                "status": "pending"
            }
        )
        order_id = create_response.json()["id"]

        # Get order
        response = client.get(f"/api/v1/orders/{order_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["customer_name"] == "John Doe"
        assert data["id"] == order_id
