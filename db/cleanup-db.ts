import pg from 'pg';
const { Pool } = pg;

async function main() {
  const pool = new Pool({
    connectionString: "postgresql://findeg_user:findeg_dev_password@localhost:5432/findeg_dev",
  });

  try {
    console.log('Cleaning up problematic columns...');
    await pool.query('ALTER TABLE catalog.product_variants DROP COLUMN IF EXISTS display_order');
    await pool.query('ALTER TABLE catalog.product_variants DROP COLUMN IF EXISTS media_set');
    await pool.query('ALTER TABLE catalog.products DROP COLUMN IF EXISTS media_set');
    console.log('Cleanup successful.');
  } catch (error) {
    console.error('Cleanup failed:', error.message);
  } finally {
    await pool.end();
  }
}

main();
