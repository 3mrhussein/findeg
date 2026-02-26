# Table Snapshot Seed Data

This folder contains CSV exports of current database tables.

- Each `*.csv` maps 1:1 to a Postgres table in the `public` schema.
- `schema-diagram.mmd` documents the approved target redesign ER model (Catalog + Identity v2 planning).
- Current runtime schema remains documented in `docs/database/SCHEMA.md`.
- CSV files are the single source of truth for seeding.
- Identity/RBAC snapshots are included:
  - `roles`, `permissions`, `role_permissions`, `user_roles`
  - `auth_accounts`, `password_credentials`
  - `organizations`, `organization_memberships`
  - `payment_methods`, `guest_principals`

Seeder:

- `scripts/seed-db.js` imports these CSV snapshots in FK-safe order.
