#!/bin/bash

echo "Starting ALPR System in development mode..."

# Stop any running containers
docker-compose down

# Remove old containers and volumes
docker-compose rm -f
docker volume rm alpr-system_mysql_data 2>/dev/null

# Create necessary directories
mkdir -p uploads logs static

# Start the services
docker-compose up --build 