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
  "user_permissions",
  "organization_memberships",
  "auth_accounts",
  "password_credentials",
  "payment_methods",
  "guest_principals",
  "brands",
  "categories",
  "products",
  "product_variants",
  "variant_images",
  "variant_attributes",
  "warehouses",
  "inventory_balances",
  "stock_movements",
  "variant_sellable_uoms",
  "variant_price_lists",
  "tags",
  "collections",
  "product_tags",
  "collection_tags",
  "attribute_definitions",
  "product_attributes",
  "discount_rules",
  "school_lists",
  "school_list_items",
  "school_list_item_alternatives",
  "addresses",
  "orders",
  "order_items",
  "reviews",
  "review_helpful_votes",
  "audit_log",
  "search_logs",
];

export const TABLE_SCHEMAS = {
  users: "identity",
  organizations: "identity",
  roles: "identity",
  permissions: "identity",
  role_permissions: "identity",
  user_roles: "identity",
  user_permissions: "identity",
  organization_memberships: "identity",
  auth_accounts: "identity",
  password_credentials: "identity",
  payment_methods: "identity",
  guest_principals: "identity",
  brands: "catalog",
  categories: "catalog",
  products: "catalog",
  product_variants: "catalog",
  variant_images: "catalog",
  variant_attributes: "catalog",
  warehouses: "inventory",
  inventory_balances: "inventory",
  stock_movements: "inventory",
  variant_sellable_uoms: "catalog",
  variant_price_lists: "catalog",
  tags: "catalog",
  collections: "catalog",
  product_tags: "catalog",
  collection_tags: "catalog",
  attribute_definitions: "catalog",
  product_attributes: "catalog",
  discount_rules: "sales",
  school_lists: "school_engine",
  school_list_items: "school_engine",
  school_list_item_alternatives: "school_engine",
  addresses: "sales",
  orders: "sales",
  order_items: "sales",
  reviews: "catalog",
  review_helpful_votes: "catalog",
  audit_log: "system",
  translations: "catalog",
  search_logs: "system",
};

/**
 * Helper to get schema for a table, defaulting to 'public'
 */
function getTableSchema(tableName) {
  return TABLE_SCHEMAS[tableName] || "public";
}

/**
 * Helper to get full table name as "schema"."table"
 */
function getFullTableName(tableName) {
  const schema = getTableSchema(tableName);
  return `"${schema}"."${tableName}"`;
}

/**
 *
 */
async function getExistingTableSet(sql, tableNames) {
  const rows = await sql`
    select table_schema || '.' || table_name as "fullTableName", table_name as "tableName"
    from information_schema.tables
    where table_schema in ('public', 'identity', 'catalog', 'sales', 'inventory', 'school_engine', 'system')
      and table_name = any(${tableNames})
  `;

  return new Set(rows.map((row) => row.tableName));
}

/**
 *
 */
async function getTableRowCount(sql, tableName) {
  const fullTable = getFullTableName(tableName);
  const rows = await sql.unsafe(`select count(*)::int as "count" from ${fullTable}`);
  return Number(rows[0]?.count ?? 0);
}

/**
 *
 */
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

/**
 *
 */
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

/**
 *
 */
async function getTableColumnMetadata(sql, tableName) {
  const schema = getTableSchema(tableName);
  const rows = await sql`
    select
      column_name as "columnName",
      data_type as "dataType",
      udt_name as "udtName",
      column_default as "columnDefault"
    from information_schema.columns
    where table_schema = ${schema}
      and table_name = ${tableName}
    order by ordinal_position
  `;

  const map = new Map();
  for (const row of rows) {
    map.set(row.columnName, row);
  }
  return map;
}

/**
 *
 */
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

/**
 *
 */
async function seedTable(sql, tableName) {
  const { headers, rows } = parseCsvTable(tableName);
  const metadata = await getTableColumnMetadata(sql, tableName);
  const schema = getTableSchema(tableName);

  // Filter headers to only include columns that exist in the database
  const validHeaders = headers.filter((header) => metadata.has(header));

  if (validHeaders.length === 0) {
    console.warn(`   ⚠️ Skipping ${tableName}: No valid columns found for seeding.`);
    return { tableName, insertedRows: 0, sourceRows: rows.length };
  }

  if (rows.length === 0) {
    return { tableName, insertedRows: 0, sourceRows: 0 };
  }

  const values = rows.map((row) => {
    const mapped = {};
    for (const header of validHeaders) {
      mapped[header] = castCell(row[header], metadata.get(header));
    }
    return mapped;
  });

  await sql`insert into ${sql(schema)}.${sql(tableName)} ${sql(values, validHeaders)}`;
  return { tableName, insertedRows: values.length, sourceRows: rows.length };
}

/**
 *
 */
async function resetIdSequenceIfPresent(sql, tableName) {
  const schema = getTableSchema(tableName);
  const hasIdColumn = await sql`
    select 1 as "exists"
    from information_schema.columns
    where table_schema = ${schema}
      and table_name = ${tableName}
      and column_name = 'id'
    limit 1
  `;
  if (hasIdColumn.length === 0) return false;

  const fullTable = `${schema}.${tableName}`;
  const seqRows = await sql`
    select pg_get_serial_sequence(${fullTable}, 'id') as "seqName"
  `;
  const seqName = seqRows[0]?.seqName;
  if (!seqName) return false;

  const statement = `
    select setval(
      '${seqName}',
      coalesce((select max(id) from "${schema}"."${tableName}"), 0) + 1,
      false
    )
  `;
  await sql.unsafe(statement);
  return true;
}

/**
 *
 */
export function createSqlClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return postgres(databaseUrl, { max: 1 });
}

/**
 *
 */
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

  const truncateTables = truncatedTables.map((tableName) => getFullTableName(tableName)).join(", ");
  if (!truncateTables) {
    return { truncatedTables: [], skippedTables, rowCounts, rowsCleared: 0 };
  }

  await sql.unsafe(`TRUNCATE TABLE ${truncateTables} RESTART IDENTITY CASCADE`);
  return { truncatedTables, skippedTables, rowCounts, rowsCleared };
}

/**
 *
 */
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
