from src.api.v1.endpoints.health import router as health_router
from src.api.v1.endpoints.authors import router as authors_router
from src.api.v1.endpoints.genres import router as genres_router
from src.api.v1.endpoints.publishers import router as publishers_router
from src.api.v1.endpoints.books import router as books_router
from src.api.v1.endpoints.orders import router as orders_router
from src.api.v1.endpoints.admin import router as admin_router
from src.api.v1.endpoints.stats import router as stats_router

__all__ = [
    "health_router",
    "authors_router",
    "genres_router",
    "publishers_router",
    "books_router",
    "orders_router",
    "admin_router",
    "stats_router",
]
