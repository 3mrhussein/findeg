
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../.env' });

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Adding is_active column to catalog.brands...');
    await sql`ALTER TABLE "catalog"."brands" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;`;
    console.log('Done!');
  } catch (error) {
    console.error('Failed to add column:', error);
  } finally {
    await sql.end();
  }
}

main();
