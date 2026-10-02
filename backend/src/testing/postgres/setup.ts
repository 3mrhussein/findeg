import { inject } from 'vitest';

/**
 * Bind application imports to the same isolated database as injected services.
 * Runs before test modules: legacy feature barrels load the shared connection
 * and validate DATABASE_URL even when a test injects its own executor.
 */
process.env.DATABASE_URL = inject('integrationDatabaseUrl');
