import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

export const TABLE_SNAPSHOT_DIR = path.resolve("scripts/data/seed/tables");

export const TABLE_IMPORT_ORDER = [
  "users",
  "organizations",
  "roles",
  "permissions",
  "role_permissions",
  "user_roles",
  "organization_memberships",
  "auth_accounts",
  "password_credentials",
  "payment_methods",
  "guest_principals",
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

async function getExistingTableSet(sql, tableNames) {
  const rows = await sql`
    select table_name as "tableName"
    from information_schema.tables
    where table_schema = 'public'
      and table_name = any(${tableNames})
  `;

  return new Set(rows.map((row) => row.tableName));
}

async function getTableRowCount(sql, tableName) {
  const escapedTableName = tableName.replace(/"/g, '""');
  const rows = await sql.unsafe(`select count(*)::int as "count" from "${escapedTableName}"`);
  return Number(rows[0]?.count ?? 0);
}

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
    return { tableName, insertedRows: 0, sourceRows: 0 };
  }

  const values = rows.map((row) => {
    const mapped = {};
    for (const header of headers) {
      mapped[header] = castCell(row[header], metadata.get(header));
    }
    return mapped;
  });

  await sql`insert into ${sql(tableName)} ${sql(values, headers)}`;
  return { tableName, insertedRows: values.length, sourceRows: rows.length };
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
  if (hasIdColumn.length === 0) return false;

  const seqRows = await sql`
    select pg_get_serial_sequence(${`public.${tableName}`}, 'id') as "seqName"
  `;
  const seqName = seqRows[0]?.seqName;
  if (!seqName) return false;

  const statement = `
    select setval(
      '${seqName}',
      coalesce((select max(id) from "${tableName}"), 0) + 1,
      false
    )
  `;
  await sql.unsafe(statement);
  return true;
}

export function createSqlClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return postgres(databaseUrl, { max: 1 });
}

export async function truncateSeedTables(sql) {
  const existingTables = await getExistingTableSet(sql, TABLE_IMPORT_ORDER);
  const truncatedTables = TABLE_IMPORT_ORDER.filter((tableName) => existingTables.has(tableName));
  const skippedTables = TABLE_IMPORT_ORDER.filter((tableName) => !existingTables.has(tableName));
  const rowCounts = {};
  let rowsCleared = 0;

  for (const tableName of truncatedTables) {
    const count = await getTableRowCount(sql, tableName);
    rowCounts[tableName] = count;
    rowsCleared += count;
  }

  const truncateTables = truncatedTables.map((tableName) => `"${tableName}"`).join(", ");
  if (!truncateTables) {
    return { truncatedTables: [], skippedTables, rowCounts, rowsCleared: 0 };
  }

  await sql.unsafe(`TRUNCATE TABLE ${truncateTables} RESTART IDENTITY CASCADE`);
  return { truncatedTables, skippedTables, rowCounts, rowsCleared };
}

export async function seedFromCsvSnapshots(sql) {
  const existingTables = await getExistingTableSet(sql, TABLE_IMPORT_ORDER);
  const importableTables = TABLE_IMPORT_ORDER.filter((tableName) => existingTables.has(tableName));
  const skippedTables = TABLE_IMPORT_ORDER.filter((tableName) => !existingTables.has(tableName));
  const tableSummaries = [];
  const sequenceResetTables = [];
  let insertedRows = 0;

  for (const tableName of importableTables) {
    const tableSummary = await seedTable(sql, tableName);
    tableSummaries.push(tableSummary);
    insertedRows += tableSummary.insertedRows;
  }

  for (const tableName of importableTables) {
    const sequenceWasReset = await resetIdSequenceIfPresent(sql, tableName);
    if (sequenceWasReset) {
      sequenceResetTables.push(tableName);
    }
  }

  return {
    importableTables,
    skippedTables,
    tableSummaries,
    sequenceResetTables,
    insertedRows,
  };
}
