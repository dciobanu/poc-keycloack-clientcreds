.PHONY: up down restart logs ps build clean help

DOCKER_COMPOSE = docker compose

# Default target when just running 'make'
help:
	@echo "Available commands:"
	@echo "  make up        - Start all containers"
	@echo "  make down      - Stop and remove all containers"
	@echo "  make restart   - Restart all containers"
	@echo "  make logs      - Show logs from all containers"
	@echo "  make ps        - Show status of containers"
	@echo "  make build     - Build/rebuild all containers"
	@echo "  make clean     - Remove all containers, networks, volumes, and images"

# Start containers
up:
	$(DOCKER_COMPOSE) up -d

# Stop and remove containers
down:
	$(DOCKER_COMPOSE) down

# Restart containers
restart:
	$(DOCKER_COMPOSE) restart

# Show logs
logs:
	$(DOCKER_COMPOSE) logs -f

# Show container status
ps:
	$(DOCKER_COMPOSE) ps

# Build/rebuild containers
build:
	$(DOCKER_COMPOSE) build

# Deep clean - removes containers, networks, volumes, and images
clean:
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
	docker system prune -f

