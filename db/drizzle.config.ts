import { defineConfig } from 'drizzle-kit';
import env from '@findeg/env/database';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/runtime/schema.ts',
  schemaFilter: ['public', 'identity', 'catalog', 'sales', 'inventory', 'school_engine', 'system'],
  out: './migrations',
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
