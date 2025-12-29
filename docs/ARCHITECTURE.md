# Architecture Overview

## Introduction

The goal of this project is to develop a simple web application based on a relational database. This application will be a simplified simulation of an online bookstore, enabling users to browse a catalog of books and make purchases. A simplified administrator panel is also provided, allowing new books to be added to the "warehouse".

## Functional Scope

### Features

1. **Book Management** – The application provides an administrator panel for adding new books to the database. Each book will be thoroughly described in the database.

2. **Access to Book Catalog** – Users will have the ability to browse the book catalog through a prepared user interface.

3. **Book Search** – The user interface will contain a search field that allows users to search for books by title, publisher, author, and genre.

4. **Book Filtering** – The user interface will contain filtering options to narrow down search results using additional book information.

5. **Book Details** – Each book in the catalog can be viewed by clicking on it.

6. **Book Ordering** – Users will have the ability to order books. For simulation purposes, users will not have access to a shopping cart, and each order will be a separate object in the database.

7. **Order Review** – The administrator will have access to a list of orders in the administration panel.

### Database Tables

Currently, 5 tables are planned:

1. Books
2. Authors
3. Publishers
4. Genres
5. Orders

## Technical Architecture

### 1. Presentation Layer

**Technology:** React, esbuild, Tailwind CSS, TypeScript

**Description:** Layer responsible for the user interface and system interaction. React components written in TypeScript will handle the frontend structure. Tailwind CSS will be responsible for the graphical layer.

### 2. Business Logic Layer

**Technology:** FastAPI (Python), SQLAlchemy (Python), Python, Uvicorn (Python)

**Description:** Layer responsible for communication between the user interface and the database. This will be a separate application written in Python, based on FastAPI and Uvicorn, with SQLAlchemy as the ORM (Object-Relational Mapping) library for database object mapping.

### 3. Data Persistence Layer

**Technology:** SQLite

**Description:** Layer responsible for data storage. The database will be based on SQLite technology, which is a very minimalist database, ideal for this project.

### 4. Infrastructure and Deployment

**Technology:** Git, Docker

**Description:** Git will be used for version control, while Docker will be used to containerize the individual application layers.
