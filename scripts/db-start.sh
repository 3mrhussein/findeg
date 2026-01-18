#!/bin/bash

# Start the development database using Docker Compose
echo "🚀 Starting development database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start the database container
docker-compose up -d postgres

# Wait for the database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose exec -T postgres pg_isready -U findeg_user -d findeg_dev > /dev/null 2>&1; do
    sleep 1
done

echo "✅ Database is ready!"
echo ""
echo "📊 Database connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: findeg_dev"
echo "  User: findeg_user"
echo "  Password: findeg_dev_password"
echo ""
echo "🔗 Connection string:"
echo "  postgresql://findeg_user:findeg_dev_password@localhost:5432/findeg_dev"
