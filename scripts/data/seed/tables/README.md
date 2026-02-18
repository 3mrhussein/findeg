# Table Snapshot Seed Data

This folder contains CSV exports of current database tables.

- Each `*.csv` maps 1:1 to a Postgres table in the `public` schema.
- `schema-diagram.mmd` is the ER diagram source for table relationships.
- CSV files are the single source of truth for seeding.

Seeder:

- `scripts/seed-db.js` imports these CSV snapshots in FK-safe order.
