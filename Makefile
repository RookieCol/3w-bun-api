# Simple Makefile for Docker operations

# Start development
dev:
	docker compose up --build

# Start in background
up:
	docker compose up --build -d

# Stop containers
down:
	docker compose down

# View logs
logs:
	docker compose logs -f

# Clean up
clean:
	docker compose down -v
	docker system prune -f

# Access shell
shell:
	docker compose exec app sh

# Check health
health:
	curl -f http://localhost:4000/health

.PHONY: dev up down logs clean shell health 