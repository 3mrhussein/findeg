import fs from 'fs';
import path from 'path';

const SCHEMA_DIR = path.join(process.cwd(), 'src/infrastructure/database/schema');
const OUTPUT_PATH = path.join(process.cwd(), 'docs/database/SCHEMA.md');

const TYPE_MAP = {
  serial: 'INT',
  integer: 'INT',
  text: 'VARCHAR',
  decimal: 'DECIMAL',
  boolean: 'BOOLEAN',
  timestamp: 'TIMESTAMP',
  jsonb: 'JSONB',
};

function extractBlock(content, startIndex) {
  let depth = 0;
  let result = '';
  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    if (char === '{') depth++;
    if (char === '}') depth--;
    result += char;
    if (depth === 0) return result;
  }
  return result;
}

function generateERDiagram() {
  const files = fs.readdirSync(SCHEMA_DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  const tableData = {};
  const relationsList = new Set();
  const variableToTable = {};

  files.forEach(file => {
    const content = fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf-8');
    
    // find all pgTable occurrences
    const pgTableMatchRaw = /export const (\w+) = pgTable\s*\(\s*"([^"]+)"\s*,\s*\{/g;
    let match;
    while ((match = pgTableMatchRaw.exec(content)) !== null) {
      const varName = match[1];
      const tableName = match[2];
      const startIndex = match.index + match[0].length - 1;
      const fieldsBlock = extractBlock(content, startIndex);
      const fieldsContent = fieldsBlock.slice(1, -1);
      
      variableToTable[varName] = tableName;
      tableData[tableName] = { fields: [], pks: new Set() };

      const lines = fieldsContent.split('\n');
      let currentField = null;

      lines.forEach(line => {
        const fieldStartMatch = line.match(/^\s*(\w+):\s*(\w+)/);
        if (fieldStartMatch) {
          const fieldName = fieldStartMatch[1];
          const fieldType = fieldStartMatch[2];
          if (['primaryKey', 'unique', 'check', 'foreignKey'].includes(fieldType)) return;

          currentField = {
            name: fieldName,
            type: TYPE_MAP[fieldType] || fieldType.toUpperCase(),
            isPK: false,
            isFK: false
          };
          tableData[tableName].fields.push(currentField);
        }

        if (currentField) {
          if (line.includes('.primaryKey()')) {
            currentField.isPK = true;
            tableData[tableName].pks.add(currentField.name);
          }
          const refMatch = line.match(/\.references\(\(\) => (\w+)\.(\w+)/);
          if (refMatch) {
            currentField.isFK = true;
            relationsList.add(JSON.stringify({ from: tableName, toVar: refMatch[1], label: currentField.name }));
          }
        }
      });

      // Check for composite PKs in the callback (simplified search in the whole file for this table's callback)
      const callbackRegex = new RegExp(`${varName}\\s*,\\s*\\{[^}]*\\}\\s*,\\s*\\((?:table|t)\\)\\s*=>\\s*\\(([\\s\\S]*?)\\)\\s*\\)`);
      const cbMatch = content.match(callbackRegex);
      if (cbMatch) {
        const compositePKMatch = cbMatch[1].match(/primaryKey\s*\(\s*{\s*columns\s*:\s*\[([\s\S]*?)\]\s*}\s*\)/);
        if (compositePKMatch) {
          const cols = compositePKMatch[1].split(',').map(c => c.trim().split('.').pop());
          cols.forEach(col => {
            tableData[tableName].pks.add(col);
            tableData[tableName].fields.forEach(f => {
              if (f.name === col) f.isPK = true;
            });
          });
        }
      }
    }

    // Parse relations()
    const relationsRegex = /export const \w+ = relations\s*\(\s*(\w+)\s*,\s*\(\s*{([^}]+)}\s*\)\s*=>\s*\(\s*{([\s\S]*?)}\s*\)\s*\)/g;
    let relMatch;
    while ((relMatch = relationsRegex.exec(content)) !== null) {
      const baseVar = relMatch[1];
      const baseTable = variableToTable[baseVar];
      const body = relMatch[3];
      const linkRegex = /(\w+):\s*(many|one)\((\w+)(?:,[\s\S]*?)?\)/g;
      let link;
      while ((link = linkRegex.exec(body)) !== null) {
        const label = link[1];
        const type = link[2];
        const targetVar = link[3];
        if (type === 'many') {
          relationsList.add(JSON.stringify({ from: baseTable, toVar: targetVar, label, type: '1:N' }));
        }
      }
    }
  });

  let erDiagram = 'erDiagram\n';
  Object.entries(tableData).forEach(([tableName, data]) => {
    erDiagram += `    ${tableName} {\n`;
    data.fields.forEach(f => {
      const indicators = [f.isPK ? 'PK' : '', f.isFK ? 'FK' : ''].filter(Boolean).join(',');
      erDiagram += `        ${f.type} ${f.name} ${indicators}\n`;
    });
    erDiagram += '    }\n';
  });

  relationsList.forEach(relStr => {
    const rel = JSON.parse(relStr);
    const targetTable = variableToTable[rel.toVar];
    if (rel.from && targetTable) {
       if (rel.type === '1:N') {
         erDiagram += `    ${rel.from} ||--o{ ${targetTable} : "${rel.label}"\n`;
       } else {
         erDiagram += `    ${targetTable} ||--o{ ${rel.from} : "${rel.label}"\n`;
       }
    }
  });

  const output = `# Database Schema\n\nThis file is auto-generated by \`scripts/generate-schema-doc.js\`.\n\n\`\`\`mermaid\n${erDiagram}\n\`\`\`\n`;
  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`✅ Schema documentation updated at ${OUTPUT_PATH}`);
}

generateERDiagram();
