# Functional Specification

## Introduction

The goal of this project is to develop a simple web application based on a relational database. This application will be a simplified simulation of an online bookstore, enabling users to browse a catalog of books and make purchases. A simplified administrator panel is also provided, allowing new books to be added to the "warehouse".

## Functional Scope

### Features

1. **Book Management** – The application provides an administrator panel for adding, editing, and removing books from the database. Each book will be thoroughly described in the database.

2. **Author Management** – The administrator can manage authors in the system, including adding, editing, and removing authors from the database.

3. **Genre Management** – The administrator can manage book genres, including adding, editing, and removing genres from the database.

4. **Publisher Management** – The administrator can manage publishers, including adding, editing, and removing publishers from the database.

5. **Access to Book Catalog** – Users will have the ability to browse the book catalog through a prepared user interface.

6. **Book Search** – The user interface will contain a search field that allows users to search for books by title, publisher, author, and genre.

7. **Book Filtering** – The user interface will contain filtering options to narrow down search results using additional book information.

8. **Book Details** – Each book in the catalog can be viewed by clicking on it.

9. **Book Ordering** – Users will have the ability to order books. For simulation purposes, users will not have access to a shopping cart, and each order will be a separate object in the database.

10. **Order Review** – The administrator will have access to a list of orders in the administration panel.

11. **Administrator Authentication** – The application provides a login system for administrators with username and password authentication. Administrators can change their password on first login.

## Database Schema

The application uses the following database tables:

1. **Books** – Stores book information (title, description, price, stock quantity, ISBN, published year)
2. **Authors** – Stores author information
3. **Publishers** – Stores publisher information
4. **Genres** – Stores book genre categories
5. **Orders** – Stores customer orders with customer details (name, email, phone), status, and total price
6. **OrderItems** – Stores individual items within each order
7. **Admins** – Stores administrator credentials and password management information

The database also includes junction tables:
- **book_author** – Many-to-many relationship between books and authors
- **book_genre** – Many-to-many relationship between books and genres
