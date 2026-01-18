#!/bin/bash

# Stop the development database
echo "🛑 Stopping development database..."
docker-compose stop postgres
echo "✅ Database stopped!"
