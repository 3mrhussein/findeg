# Docker Database Setup

This project uses Docker to run a PostgreSQL database for development.

## Quick Start

1. **Start the database:**
   ```bash
   npm run db:start
   ```

2. **Update your `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Run database migrations:**
   ```bash
   npm run db:push
   ```

4. **(Optional) Seed the database:**
   ```bash
   npm run db:seed
   ```

## Available Scripts

- `npm run db:start` - Start the PostgreSQL container
- `npm run db:stop` - Stop the PostgreSQL container
- `npm run db:reset` - Reset the database (⚠️ deletes all data)
- `npm run db:logs` - View database container logs
- `npm run db:studio` - Open Drizzle Studio to browse the database
- `npm run db:push` - Push schema changes to the database
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations

## Database Connection Details

- **Host:** localhost
- **Port:** 5432
- **Database:** findeg_dev
- **User:** findeg_user
- **Password:** findeg_dev_password
- **Connection String:** `postgresql://findeg_user:findeg_dev_password@localhost:5432/findeg_dev`

## Troubleshooting

### Port 5432 already in use
If you have PostgreSQL installed locally, it might be using port 5432. You can either:
1. Stop your local PostgreSQL service
2. Change the port mapping in `docker-compose.yml` (e.g., `5433:5432`)

### Container won't start
Make sure Docker is running:
```bash
docker info
```

### View container status
```bash
docker-compose ps
```

### Access database directly
```bash
docker-compose exec postgres psql -U findeg_user -d findeg_dev
```
