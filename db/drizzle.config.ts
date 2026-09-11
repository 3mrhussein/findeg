import { defineConfig } from 'drizzle-kit';
import env from '@findeg/env/database';

export default defineConfig({
  dialect: 'postgresql',
  schema: [
    './src/schema/identity/*.ts',
    './src/schema/catalog/*.ts',
    './src/schema/sales/*.ts',
    './src/schema/inventory/*.ts',
    './src/schema/school-engine/*.ts',
    './src/schema/system/*.ts',
    './src/schema/*.ts',
  ],
  schemaFilter: ['public', 'identity', 'catalog', 'sales', 'inventory', 'school_engine', 'system'],
  out: './migrations',
  dbCredentials: {
    url: `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`
    ,
  },
  verbose: true,
  strict: true,
});
