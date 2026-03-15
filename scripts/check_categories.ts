import postgres from "postgres";

const sql = postgres("postgresql://findeg_user:findeg_dev_password@localhost:5432/findeg_dev");

async function main() {
  const rows = await sql`
    SELECT id, slug, localized_name, parent_id, depth
    FROM catalog.categories
    ORDER BY id
    LIMIT 10;
  `;
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

main();
