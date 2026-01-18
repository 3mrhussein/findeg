#!/bin/bash

# Reset the development database (WARNING: This will delete all data!)
echo "⚠️  WARNING: This will delete all data in the development database!"
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Database reset cancelled."
    exit 1
fi

echo "🗑️  Stopping and removing database container..."
docker-compose down -v

echo "🚀 Starting fresh database..."
./scripts/db-start.sh

echo "✅ Database has been reset!"
