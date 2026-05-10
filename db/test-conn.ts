import postgres from "postgres";

const sql = postgres("postgresql://findeg_user:findeg_dev_password@localhost:5432/findeg_dev", {
  ssl: false,
});

async function main() {
  try {
    const result = await sql`SELECT 1`;
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

main();
