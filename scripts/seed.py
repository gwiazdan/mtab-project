#!/usr/bin/env python3
"""Seed script to populate database with test data"""
import requests
import time
import sys

BASE_URL = "http://backend:8000/api/v1"
MAX_RETRIES = 30
RETRY_DELAY = 1


def wait_for_api():
    """Wait for API to be ready"""
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=2)
            if response.status_code == 200:
                print("✅ API is ready!")
                return True
        except requests.exceptions.ConnectionError:
            print(f"⏳ Waiting for API... ({attempt + 1}/{MAX_RETRIES})")
            time.sleep(RETRY_DELAY)

    print("❌ API did not start in time")
    return False


def seed_authors():
    """Create test authors"""
    print("\n📝 Creating authors...")
    authors_data = [
        {"name": "J.K. Rowling", "bio": "British author, creator of Harry Potter"},
        {"name": "George R.R. Martin", "bio": "American author of A Song of Ice and Fire"},
        {"name": "J.R.R. Tolkien", "bio": "British writer, creator of Middle-earth"},
        {"name": "Stephen King", "bio": "American horror and suspense novelist"},
        {"name": "Agatha Christie", "bio": "British mystery and crime writer"},
    ]

    authors = []
    for author_data in authors_data:
        response = requests.post(f"{BASE_URL}/authors", json=author_data)
        if response.status_code == 201:
            authors.append(response.json())
            print(f"  ✅ {author_data['name']}")
        else:
            print(f"  ❌ Failed to create {author_data['name']}: {response.text}")

    return authors


def seed_genres():
    """Create test genres"""
    print("\n📚 Creating genres...")
    genres_data = [
        {"name": "Fantasy", "description": "Fantasy and magical worlds"},
        {"name": "Science Fiction", "description": "Science fiction and futuristic worlds"},
        {"name": "Mystery", "description": "Mystery and detective stories"},
        {"name": "Romance", "description": "Romance and love stories"},
        {"name": "Horror", "description": "Horror and thriller stories"},
    ]

    genres = []
    for genre_data in genres_data:
        response = requests.post(f"{BASE_URL}/genres", json=genre_data)
        if response.status_code == 201:
            genres.append(response.json())
            print(f"  ✅ {genre_data['name']}")
        else:
            print(f"  ❌ Failed to create {genre_data['name']}: {response.text}")

    return genres


def seed_publishers():
    """Create test publishers"""
    print("\n🏢 Creating publishers...")
    publishers_data = [
        {"name": "Bloomsbury Publishing", "address": "London, UK", "contact": "info@bloomsbury.com"},
        {"name": "Penguin Books", "address": "London, UK", "contact": "info@penguin.com"},
        {"name": "HarperCollins", "address": "New York, USA", "contact": "info@harpercollins.com"},
        {"name": "Tor Books", "address": "New York, USA", "contact": "info@torbooks.com"},
        {"name": "Doubleday", "address": "New York, USA", "contact": "info@doubleday.com"},
    ]

    publishers = []
    for publisher_data in publishers_data:
        response = requests.post(f"{BASE_URL}/publishers", json=publisher_data)
        if response.status_code == 201:
            publishers.append(response.json())
            print(f"  ✅ {publisher_data['name']}")
        else:
            print(f"  ❌ Failed to create {publisher_data['name']}: {response.text}")

    return publishers


def seed_books(authors, genres, publishers):
    """Create test books with relationships"""
    print("\n📖 Creating books...")

    if not authors or not genres or not publishers:
        print("  ⚠️  Skipping books - missing authors, genres, or publishers")
        return []
    
    books_data = [
        {
            "title": "Harry Potter and the Philosopher's Stone",
            "description": "The first book in the Harry Potter series",
            "price": 15.99,
            "stock": 50,
            "isbn": "978-0747532699",
            "published_year": 1997,
            "publisher_id": publishers[0]["id"],
            "author_ids": [authors[0]["id"]],
            "genre_ids": [genres[0]["id"]]  # Fantasy
        },
        {
            "title": "A Game of Thrones",
            "description": "The first book in A Song of Ice and Fire",
            "price": 18.99,
            "stock": 40,
            "isbn": "978-0553103540",
            "published_year": 1996,
            "publisher_id": publishers[3]["id"],  # Tor Books
            "author_ids": [authors[1]["id"]],
            "genre_ids": [genres[0]["id"]]  # Fantasy
        },
        {
            "title": "The Hobbit",
            "description": "A fantasy adventure novel",
            "price": 14.99,
            "stock": 60,
            "isbn": "978-0547928227",
            "published_year": 1937,
            "publisher_id": publishers[1]["id"],  # Penguin
            "author_ids": [authors[2]["id"]],
            "genre_ids": [genres[0]["id"]]  # Fantasy
        },
        {
            "title": "The Shining",
            "description": "A psychological horror novel",
            "price": 12.99,
            "stock": 35,
            "isbn": "978-0385333312",
            "published_year": 1977,
            "publisher_id": publishers[2]["id"],  # HarperCollins
            "author_ids": [authors[3]["id"]],
            "genre_ids": [genres[4]["id"]]  # Horror
        },
        {
            "title": "Murder on the Orient Express",
            "description": "A detective mystery novel",
            "price": 11.99,
            "stock": 45,
            "isbn": "978-0062693556",
            "published_year": 1934,
            "publisher_id": publishers[4]["id"],  # Doubleday
            "author_ids": [authors[4]["id"]],
            "genre_ids": [genres[2]["id"]]  # Mystery
        },
    ]
    
    books = []
    for book_data in books_data:
        response = requests.post(f"{BASE_URL}/books", json=book_data)
        if response.status_code == 201:
            books.append(response.json())
            print(f"  ✅ {book_data['title']}")
        else:
            print(f"  ❌ Failed to create {book_data['title']}: {response.text}")
    
    return books


def seed_orders(books):
    """Create test orders with items"""
    print("\n🛒 Creating orders...")
    
    if len(books) < 2:
        print("  ⚠️  Skipping orders - need at least 2 books")
        return
    
    # Create one order
    order_data = {
        "customer_name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "status": "pending"
    }
    
    response = requests.post(f"{BASE_URL}/orders", json=order_data)
    if response.status_code != 201:
        print(f"  ❌ Failed to create order: {response.text}")
        return
    
    order = response.json()
    print(f"  ✅ Order #{order['id']}")
    
    # Add 2 random books to order
    import random
    selected_books = random.sample(books, 2)
    
    for book in selected_books:
        item_data = {
            "order_id": order["id"],
            "book_id": book["id"],
            "quantity": random.randint(1, 3)
        }
        
        response = requests.post(f"{BASE_URL}/orders/items", json=item_data)
        if response.status_code == 201:
            print(f"    ✅ Added {book['title']} x{item_data['quantity']}")
        else:
            print(f"    ❌ Failed to add item: {response.text}")


def main():
    """Main seed function"""
    print("🌱 Starting database seed...\n")
    
    if not wait_for_api():
        sys.exit(1)
    
    authors = seed_authors()
    genres = seed_genres()
    publishers = seed_publishers()
    books = seed_books(authors, genres, publishers)
    seed_orders(books)
    
    print("\n✨ Seed completed!")


if __name__ == "__main__":
    main()


