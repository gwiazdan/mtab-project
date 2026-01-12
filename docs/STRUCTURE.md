# Project Structure

```
mtab-project/
├─ backend/                    # FastAPI backend service (Python)
│  ├─ src/
│  │  ├─ api/v1/
│  │  │  ├─ endpoints/        # API endpoint handlers (admin, books, authors, etc.)
│  │  │  └─ routes/           # Route configuration
│  │  ├─ models/              # SQLAlchemy database models
│  │  ├─ schemas/             # Pydantic validation schemas
│  │  ├─ core/                # Config and database setup
│  ├─ tests/                  # Backend tests
│  ├─ main.py                 # FastAPI app entry point
│  ├─ Dockerfile              # Backend container configuration
│  └─ pyproject.toml          # Python dependencies (Poetry)
│
├─ frontend/                   # React TypeScript frontend
│  ├─ src/
│  │  ├─ pages/               # Page components (Shop, Admin, Login, etc.)
│  │  ├─ components/          # Reusable UI components
│  │  ├─ context/             # React Context (Auth, Cart)
│  │  ├─ api/                 # API client functions
│  │  ├─ types/               # TypeScript type definitions
│  │  ├─ layouts/             # Layout wrappers
│  │  ├─ App.tsx              # Root component
│  │  ├─ router.tsx           # Route configuration
│  │  └─ globals.css          # Global styles
│  ├─ public/                 # Static assets (icons, images)
│  ├─ Dockerfile              # Frontend container configuration
│  ├─ nginx.conf              # Nginx configuration
│  ├─ package.json            # Node dependencies
│  ├─ tailwind.config.mjs     # Tailwind CSS configuration
│  └─ tsconfig.json           # TypeScript configuration
│
├─ db/                         # SQLite database directory
├─ docs/                       # Documentation
│  ├─ ARCHITECTURE.md         # Technical architecture
│  ├─ SPECIFICATION.md        # Functional requirements
│  └─ STRUCTURE.md            # This file
│
├─ scripts/
│  └─ seed.py                 # Database seeding script
│
├─ docker-compose.yml         # Production Docker Compose
├─ docker-compose.dev.yml     # Development Docker Compose
├─ nginx-proxy.conf           # Nginx reverse proxy configuration
├─ Makefile                   # Build and run commands
├─ package.json               # Root package.json (monorepo)
├─ README.md                  # Project documentation
└─ LICENSE                    # License file
```

## Key Files & Directories

### Backend (`backend/`)
- **main.py** – FastAPI application entry point
- **src/api/** – All REST API endpoints and routes
- **src/models/** – Database models (Books, Authors, Orders, etc.)
- **src/schemas/** – Request/response validation schemas
- **src/core/** – Configuration and database initialization

### Frontend (`frontend/`)
- **src/pages/** – Full page components (Shop, Admin dashboard, Login)
- **src/components/** – Reusable UI building blocks
- **src/context/** – Global state management (authentication, shopping cart)
- **public/** – Static assets and icons

### Configuration Files
- **docker-compose.yml** – Production containers setup
- **docker-compose.dev.yml** – Development environment
- **.env** – Environment variables
- **Makefile** – Common commands for building and running
