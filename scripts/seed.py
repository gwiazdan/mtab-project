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


def main():
    """Main seed function"""
    print("🌱 Starting database seed...\n")

    if not wait_for_api():
        sys.exit(1)

    seed_authors()
    seed_genres()
    seed_publishers()

    print("\n✨ Seed completed!")


if __name__ == "__main__":
    main()
