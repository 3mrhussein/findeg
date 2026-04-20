import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TABLE_SNAPSHOT_DIR = path.resolve(__dirname, 'data/seed/tables');
const DEST_DIR = path.resolve(__dirname, '../../../db/seeds/data');

fs.mkdirSync(DEST_DIR, { recursive: true });

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

function castValue(val) {
  if (val === '') return null;
  const lower = val.toLowerCase();
  
  if (lower === 'true' || lower === 't') return true;
  if (lower === 'false' || lower === 'f') return false;
  
  // Is it a number? Ensure we don't accidentally cast empty strings or completely whitespace strings
  if (!isNaN(val) && val.trim() !== '') {
    // If it's a huge ID (like a UUID or Snowflake), keep it as string if it isn't safely parsed
    const parsed = Number(val);
    if (Number.isSafeInteger(parsed) || (!Number.isNaN(parsed) && val.includes('.'))) {
      // Actually, leading zeros are important for things like ZIP codes.
      // E.g., '0123' should stay '0123'. 
      // If `val` has leading zero and isn't '0' or '0.x', it's probably a string.
      if (val.length > 1 && val.startsWith('0') && !val.startsWith('0.')) {
        return val; // Treat as string
      }
      return parsed;
    }
  }
  
  // Try JSON
  try {
    if (val.startsWith('{') || val.startsWith('[')) {
      return JSON.parse(val);
    }
  } catch (e) {
    // Ignore JSON parse errors and return original string
  }
  
  return val;
}

function convertTable(tableName) {
  const filePath = path.join(TABLE_SNAPSHOT_DIR, `${tableName}.csv`);
  if (!fs.existsSync(filePath)) {
    console.warn(`[Skip] Missing snapshot CSV for table "${tableName}"`);
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);

  if (lines.length === 0) {
    console.warn(`[Skip] CSV for table "${tableName}" is empty.`);
    return;
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  if (headers.length === 0) {
    console.warn(`[Skip] CSV for table "${tableName}" has no headers.`);
    return;
  }

  // Preserve completely empty tables? Requirement: "empty/header-only CSVs are populated with minimal representative data to validate orchestration."
  // Wait, if it has 0 rows, I'll output an empty array []. Then when I build the typescript seeds, I'll add minimal data.
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = castValue(cells[index] ?? "");
    });
    return row;
  });

  const outputFilePath = path.join(DEST_DIR, `${tableName}.json`);
  fs.writeFileSync(outputFilePath, JSON.stringify(rows, null, 2), "utf8");
  console.log(`[Success] -> Converted ${tableName}.csv to ${tableName}.json (${rows.length} rows)`);
}

const csvFiles = fs.readdirSync(TABLE_SNAPSHOT_DIR);
for (const file of csvFiles) {
  if (file.endsWith('.csv')) {
    const tableName = file.replace('.csv', '');
    convertTable(tableName);
  }
}

console.log("Migration script finished!");
