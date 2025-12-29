# Functional Specification

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

## Database Schema

Currently, 5 tables are planned:

1. **Books** – Stores book information (title, description, price, stock quantity)
2. **Authors** – Stores author information
3. **Publishers** – Stores publisher information
4. **Genres** – Stores book genre categories
5. **Orders** – Stores customer orders and order details
