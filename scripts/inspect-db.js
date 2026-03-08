import postgres from "postgres";
import { config } from "dotenv";
import fs from "fs";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  const report = {};
  try {
    const columns = await sql`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_name IN ('category_translations', 'product_translations', 'products')
      ORDER BY table_name, column_name
    `;
    report.columns = columns;

    const productCount = await sql`SELECT count(*) FROM products`;
    report.productCount = productCount[0].count;

    const categoryCount = await sql`SELECT count(*) FROM categories`;
    report.categoryCount = categoryCount[0].count;

    fs.writeFileSync("./db_report.json", JSON.stringify(report, null, 2));
    console.log("Report written to db_report.json");
  } catch (error) {
    fs.writeFileSync("./db_report_error.txt", error.stack);
  } finally {
    await sql.end();
  }
}

run();
