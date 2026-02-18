import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

export const TABLE_SNAPSHOT_DIR = path.resolve("scripts/data/seed/tables");

export const TABLE_IMPORT_ORDER = [
  "users",
  "brands",
  "categories",
  "category_translations",
  "products",
  "product_translations",
  "product_images",
  "variant_sellable_uoms",
  "variant_price_lists",
  "addresses",
  "orders",
  "order_items",
  "reviews",
  "audit_log",
  "translations",
];

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsvTable(tableName) {
  const filePath = path.join(TABLE_SNAPSHOT_DIR, `${tableName}.csv`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing snapshot CSV for table "${tableName}" at ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error(`CSV for table "${tableName}" is empty.`);
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  if (headers.length === 0) {
    throw new Error(`CSV for table "${tableName}" has no headers.`);
  }

  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

async function getTableColumnMetadata(sql, tableName) {
  const rows = await sql`
    select
      column_name as "columnName",
      data_type as "dataType",
      udt_name as "udtName",
      column_default as "columnDefault"
    from information_schema.columns
    where table_schema = 'public'
      and table_name = ${tableName}
    order by ordinal_position
  `;

  const map = new Map();
  for (const row of rows) {
    map.set(row.columnName, row);
  }
  return map;
}

function castCell(rawValue, columnMeta) {
  if (rawValue === "") return null;

  const normalized = String(rawValue).trim();
  const dataType = columnMeta?.dataType;

  if (dataType === "boolean") {
    const lowered = normalized.toLowerCase();
    return lowered === "true" || lowered === "t" || lowered === "1" || lowered === "yes";
  }

  if (dataType === "smallint" || dataType === "integer" || dataType === "bigint") {
    return Number.parseInt(normalized, 10);
  }

  if (dataType === "json" || dataType === "jsonb") {
    try {
      return JSON.parse(normalized);
    } catch {
      return normalized;
    }
  }

  return rawValue;
}

async function seedTable(sql, tableName) {
  const { headers, rows } = parseCsvTable(tableName);
  const metadata = await getTableColumnMetadata(sql, tableName);

  for (const header of headers) {
    if (!metadata.has(header)) {
      throw new Error(`Unknown column "${header}" in ${tableName}.csv`);
    }
  }

  if (rows.length === 0) {
    console.log(`📄 ${tableName}: 0 rows`);
    return;
  }

  const values = rows.map((row) => {
    const mapped = {};
    for (const header of headers) {
      mapped[header] = castCell(row[header], metadata.get(header));
    }
    return mapped;
  });

  await sql`insert into ${sql(tableName)} ${sql(values, headers)}`;
  console.log(`📄 ${tableName}: ${values.length} rows`);
}

async function resetIdSequenceIfPresent(sql, tableName) {
  const hasIdColumn = await sql`
    select 1 as "exists"
    from information_schema.columns
    where table_schema = 'public'
      and table_name = ${tableName}
      and column_name = 'id'
    limit 1
  `;
  if (hasIdColumn.length === 0) return;

  const seqRows = await sql`
    select pg_get_serial_sequence(${`public.${tableName}`}, 'id') as "seqName"
  `;
  const seqName = seqRows[0]?.seqName;
  if (!seqName) return;

  const statement = `
    select setval(
      '${seqName}',
      coalesce((select max(id) from "${tableName}"), 0) + 1,
      false
    )
  `;
  await sql.unsafe(statement);
}

export function createSqlClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return postgres(databaseUrl, { max: 1 });
}

export async function truncateSeedTables(sql) {
  const truncateTables = TABLE_IMPORT_ORDER.map((tableName) => `"${tableName}"`).join(", ");
  await sql.unsafe(`TRUNCATE TABLE ${truncateTables} RESTART IDENTITY CASCADE`);
}

export async function seedFromCsvSnapshots(sql) {
  for (const tableName of TABLE_IMPORT_ORDER) {
    await seedTable(sql, tableName);
  }

  for (const tableName of TABLE_IMPORT_ORDER) {
    await resetIdSequenceIfPresent(sql, tableName);
  }
}
