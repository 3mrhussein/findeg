import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import env from '@findeg/env/database';

async function main() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  });
  const db = drizzle(pool);

  try {
    console.log('Renaming catalog.attribute_definitions to catalog.attributes...');
    await pool.query('ALTER TABLE catalog.attribute_definitions RENAME TO attributes');
    console.log('Renaming successful.');
  } catch (error) {
    console.error('Renaming failed (maybe already renamed?):', error.message);
  } finally {
    await pool.end();
  }
}

main();
