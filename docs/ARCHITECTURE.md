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
