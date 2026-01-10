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
    """Create test authors (idempotent)"""
    print("\n📝 Creating authors...")

    # Check if authors already exist
    try:
        response = requests.get(f"{BASE_URL}/authors")
        if response.status_code == 200 and len(response.json()) > 0:
            authors = response.json()
            print(f"  ℹ️  Found {len(authors)} existing authors, skipping seed")
            return authors
    except:
        pass

    authors_data = [
        {"name": "J.K. Rowling", "bio": "British author, creator of Harry Potter"},
        {"name": "George R.R. Martin", "bio": "American author of A Song of Ice and Fire"},
        {"name": "J.R.R. Tolkien", "bio": "British writer, creator of Middle-earth"},
        {"name": "Stephen King", "bio": "American horror and suspense novelist"},
        {"name": "Agatha Christie", "bio": "British mystery and crime writer"},
        {"name": "Isaac Asimov", "bio": "American writer and professor of biochemistry"},
        {"name": "Arthur C. Clarke", "bio": "British science fiction writer and inventor"},
        {"name": "Philip K. Dick", "bio": "American science fiction novelist"},
        {"name": "Ursula K. Le Guin", "bio": "American author of science fiction and fantasy"},
        {"name": "Terry Pratchett", "bio": "British fantasy author, known for Discworld"},
        {"name": "Neil Gaiman", "bio": "British and American author of fantasy and science fiction"},
        {"name": "Brandon Sanderson", "bio": "American fantasy writer and author of Mistborn"},
    ]

    authors = []
    for author_data in authors_data:
        response = requests.post(f"{BASE_URL}/authors", json=author_data)
        if response.status_code == 201:
            authors.append(response.json())
            print(f"  ✅ {author_data['name']}")
        elif response.status_code == 409:
            # Already exists, fetch it
            print(f"  ℹ️  {author_data['name']} already exists")
        else:
            print(f"  ❌ Failed to create {author_data['name']}: {response.text}")

    return authors


def seed_genres():
    """Create test genres (idempotent)"""
    print("\n📚 Creating genres...")

    # Check if genres already exist
    try:
        response = requests.get(f"{BASE_URL}/genres")
        if response.status_code == 200 and len(response.json()) > 0:
            genres = response.json()
            print(f"  ℹ️  Found {len(genres)} existing genres, skipping seed")
            return genres
    except:
        pass

    genres_data = [
        {"name": "Fantasy", "description": "Fantasy and magical worlds"},
        {"name": "Science Fiction", "description": "Science fiction and futuristic worlds"},
        {"name": "Mystery", "description": "Mystery and detective stories"},
        {"name": "Romance", "description": "Romance and love stories"},
        {"name": "Horror", "description": "Horror and thriller stories"},
        {"name": "Adventure", "description": "Adventure and exploration stories"},
        {"name": "Dystopian", "description": "Dystopian and post-apocalyptic stories"},
        {"name": "Comedy", "description": "Humorous and comedic stories"},
    ]

    genres = []
    for genre_data in genres_data:
        response = requests.post(f"{BASE_URL}/genres", json=genre_data)
        if response.status_code == 201:
            genres.append(response.json())
            print(f"  ✅ {genre_data['name']}")
        elif response.status_code == 409:
            print(f"  ℹ️  {genre_data['name']} already exists")
        else:
            print(f"  ❌ Failed to create {genre_data['name']}: {response.text}")

    return genres


def seed_publishers():
    """Create test publishers (idempotent)"""
    print("\n🏢 Creating publishers...")

    # Check if publishers already exist
    try:
        response = requests.get(f"{BASE_URL}/publishers")
        if response.status_code == 200 and len(response.json()) > 0:
            publishers = response.json()
            print(f"  ℹ️  Found {len(publishers)} existing publishers, skipping seed")
            return publishers
    except:
        pass

    publishers_data = [
        {"name": "Bloomsbury Publishing", "address": "London, UK", "contact": "info@bloomsbury.com"},
        {"name": "Penguin Books", "address": "London, UK", "contact": "info@penguin.com"},
        {"name": "HarperCollins", "address": "New York, USA", "contact": "info@harpercollins.com"},
        {"name": "Tor Books", "address": "New York, USA", "contact": "info@torbooks.com"},
        {"name": "Doubleday", "address": "New York, USA", "contact": "info@doubleday.com"},
        {"name": "Bantam Books", "address": "New York, USA", "contact": "info@bantam.com"},
        {"name": "Simon & Schuster", "address": "New York, USA", "contact": "info@simonschuster.com"},
    ]

    publishers = []
    for publisher_data in publishers_data:
        response = requests.post(f"{BASE_URL}/publishers", json=publisher_data)
        if response.status_code == 201:
            publishers.append(response.json())
            print(f"  ✅ {publisher_data['name']}")
        elif response.status_code == 409:
            print(f"  ℹ️  {publisher_data['name']} already exists")
        else:
            print(f"  ❌ Failed to create {publisher_data['name']}: {response.text}")

    return publishers


def seed_books(authors, genres, publishers):
    """Create test books with relationships (idempotent)"""
    print("\n📖 Creating books...")

    # Check if books already exist
    try:
        response = requests.get(f"{BASE_URL}/books")
        if response.status_code == 200:
            data = response.json()
            books = data.get("items", []) if isinstance(data, dict) else data
            if len(books) > 0:
                print(f"  ℹ️  Found {len(books)} existing books, skipping seed")
                return books
    except:
        pass

    if not authors or not genres or not publishers:
        print("  ⚠️  Skipping books - missing authors, genres, or publishers")
        return []

    books_data = [
        {
            "title": "Harry Potter and the Philosopher's Stone",
            "description": "The first book in the Harry Potter series about a young wizard discovering his magical powers",
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
            "description": "The first book in A Song of Ice and Fire, a tale of political intrigue and warfare",
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
            "description": "A fantasy adventure novel about a hobbit's unexpected journey",
            "price": 14.99,
            "stock": 60,
            "isbn": "978-0547928227",
            "published_year": 1937,
            "publisher_id": publishers[1]["id"],  # Penguin
            "author_ids": [authors[2]["id"]],
            "genre_ids": [genres[0]["id"], genres[5]["id"]]  # Fantasy, Adventure
        },
        {
            "title": "The Shining",
            "description": "A psychological horror novel about a family isolated in a haunted hotel",
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
            "description": "A detective mystery novel featuring Hercule Poirot solving a locked-room murder",
            "price": 11.99,
            "stock": 45,
            "isbn": "978-0062693556",
            "published_year": 1934,
            "publisher_id": publishers[4]["id"],  # Doubleday
            "author_ids": [authors[4]["id"]],
            "genre_ids": [genres[2]["id"]]  # Mystery
        },
        {
            "title": "Foundation",
            "description": "The first book in the Foundation series, exploring the fall and rise of galactic empires",
            "price": 16.99,
            "stock": 55,
            "isbn": "978-0553293357",
            "published_year": 1951,
            "publisher_id": publishers[5]["id"],
            "author_ids": [authors[5]["id"]],
            "genre_ids": [genres[1]["id"]]  # Science Fiction
        },
        {
            "title": "2001: A Space Odyssey",
            "description": "A groundbreaking science fiction novel about space exploration and artificial intelligence",
            "price": 17.99,
            "stock": 38,
            "isbn": "978-0451452084",
            "published_year": 1968,
            "publisher_id": publishers[1]["id"],
            "author_ids": [authors[6]["id"]],
            "genre_ids": [genres[1]["id"]]  # Science Fiction
        },
        {
            "title": "Ubik",
            "description": "A mind-bending science fiction novel about reality and perception",
            "price": 14.99,
            "stock": 42,
            "isbn": "978-0679735779",
            "published_year": 1969,
            "publisher_id": publishers[2]["id"],
            "author_ids": [authors[7]["id"]],
            "genre_ids": [genres[1]["id"]]  # Science Fiction
        },
        {
            "title": "The Left Hand of Darkness",
            "description": "A science fiction classic exploring gender and society on an alien world",
            "price": 15.49,
            "stock": 48,
            "isbn": "978-0441478522",
            "published_year": 1969,
            "publisher_id": publishers[6]["id"],
            "author_ids": [authors[8]["id"]],
            "genre_ids": [genres[1]["id"]]  # Science Fiction
        },
        {
            "title": "Small Gods",
            "description": "A fantasy comedy about belief and a small god in the Discworld universe",
            "price": 13.99,
            "stock": 52,
            "isbn": "978-0552140379",
            "published_year": 1992,
            "publisher_id": publishers[1]["id"],
            "author_ids": [authors[9]["id"]],
            "genre_ids": [genres[0]["id"], genres[7]["id"]]  # Fantasy, Comedy
        },
        {
            "title": "American Gods",
            "description": "A dark fantasy novel about gods and myths in modern America",
            "price": 19.99,
            "stock": 37,
            "isbn": "978-0380789023",
            "published_year": 2001,
            "publisher_id": publishers[3]["id"],
            "author_ids": [authors[10]["id"]],
            "genre_ids": [genres[0]["id"]]  # Fantasy
        },
        {
            "title": "Mistborn: The Final Empire",
            "description": "An epic fantasy about a street urchin who discovers she has magical powers",
            "price": 18.99,
            "stock": 44,
            "isbn": "978-0765311789",
            "published_year": 2006,
            "publisher_id": publishers[4]["id"],
            "author_ids": [authors[11]["id"]],
            "genre_ids": [genres[0]["id"], genres[5]["id"]]  # Fantasy, Adventure
        },
        {
            "title": "Harry Potter and the Chamber of Secrets",
            "description": "The second book in the Harry Potter series with new magical challenges",
            "price": 15.99,
            "stock": 48,
            "isbn": "978-0747538493",
            "published_year": 1998,
            "publisher_id": publishers[0]["id"],
            "author_ids": [authors[0]["id"]],
            "genre_ids": [genres[0]["id"]]  # Fantasy
        },
        {
            "title": "The Stand",
            "description": "A post-apocalyptic horror novel about survivors of a devastating plague",
            "price": 19.99,
            "stock": 33,
            "isbn": "978-0385333313",
            "published_year": 1978,
            "publisher_id": publishers[2]["id"],
            "author_ids": [authors[3]["id"]],
            "genre_ids": [genres[4]["id"], genres[6]["id"]]  # Horror, Dystopian
        },
        {
            "title": "Dune",
            "description": "An epic science fiction novel set on a desert planet with political intrigue",
            "price": 18.99,
            "stock": 41,
            "isbn": "978-0441172719",
            "published_year": 1965,
            "publisher_id": publishers[5]["id"],
            "author_ids": [authors[6]["id"]],
            "genre_ids": [genres[1]["id"]]  # Science Fiction
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
    """Create test orders with items (idempotent)"""
    print("\n🛒 Creating orders...")

    # Check if orders already exist
    try:
        response = requests.get(f"{BASE_URL}/orders")
        if response.status_code == 200 and len(response.json()) > 0:
            print(f"  ℹ️  Found {len(response.json())} existing orders, skipping seed")
            return
    except:
        pass

    if len(books) < 2:
        print("  ⚠️  Skipping orders - need at least 2 books")
        return

    # Create one order with items using checkout flow
    import random
    selected_books = random.sample(books, min(2, len(books)))

    # Calculate total price
    items = []
    total_price = 0.0
    for book in selected_books:
        quantity = random.randint(1, 3)
        items.append({
            "book_id": book["id"],
            "quantity": quantity
        })
        total_price += book["price"] * quantity

    order_data = {
        "customer_name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "total_price": total_price,
        "items": items
    }

    response = requests.post(f"{BASE_URL}/orders", json=order_data)
    if response.status_code == 201:
        order = response.json()
        print(f"  ✅ Order #{order['id']} created with {len(items)} items")
    else:
        print(f"  ❌ Failed to create order: {response.text}")


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


