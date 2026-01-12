.PHONY: help dev prod build down logs clean clean-images

help:
	@echo "Available commands:"
	@echo "  make prod           - Run production environment"
	@echo "  make build          - Build Docker images"
	@echo "  make down           - Stop all containers"
	@echo "  make logs           - Show container logs"
	@echo "  make clean          - Remove containers and volumes"
	@echo "  make clean-images   - Remove built Docker images"

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

clean-images:
	docker image rm mtab-project-backend mtab-project-frontend 2>/dev/null || true
	docker image prune -f
