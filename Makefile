.PHONY: help dev prod build down logs clean clean-images

help:
	@echo "Available commands:"
	@echo "  make dev       - Run development environment (with hot-reload)"
	@echo "  make prod      - Run production environment"
	@echo "  make build     - Build Docker images"
	@echo "  make down      - Stop all containers"
	@echo "  make logs      - Show container logs"
	@echo "  make clean     - Remove containers and volumes"
	@echo "  make clean-images - Remove built Docker images"

dev:
	docker-compose -f docker-compose.dev.yml build
	docker-compose -f docker-compose.dev.yml up

prod:
	docker-compose build
	docker-compose up

build:
	docker-compose build

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v

clean-images:
	docker image rm mtab-project-backend mtab-project-nginx 2>/dev/null || true
