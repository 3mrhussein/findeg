#!/bin/bash

# View database container logs
echo "📋 Showing database logs (press Ctrl+C to exit)..."
docker-compose logs -f postgres
