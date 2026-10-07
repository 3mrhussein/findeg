import fs from 'node:fs';

const ua = '/Users/amr/projects/findeg/db/.ua';
const input = JSON.parse(fs.readFileSync(`${ua}/tmp/ua-arch-input.json`, 'utf8'));
const groups = {
  tests: [],
  documentation: [],
  seeding: [],
  queries: [],
  schema: [],
  contracts: [],
  operations: [],
};

for (const node of input.fileNodes) {
  const file = node.filePath;
  if (/(^|\/)(__tests__|tests)(\/|$)/.test(file) || /(^|\.)test\.[^.]+$/.test(file) || /(^|\.)spec\.[^.]+$/.test(file)) groups.tests.push(node.id);
  else if (node.type === 'document' || file.startsWith('docs/') || file.endsWith('.md')) groups.documentation.push(node.id);
  else if (file === 'seed.ts' || file.startsWith('seeds/')) groups.seeding.push(node.id);
  else if (file.startsWith('src/queries/')) groups.queries.push(node.id);
  else if (file === 'src/connection.ts' || file.startsWith('src/schema/')) groups.schema.push(node.id);
  else if (file === 'src/index.ts' || file.startsWith('src/types/')) groups.contracts.push(node.id);
  else groups.operations.push(node.id);
}

const layers = [
  { id: 'layer:query-and-transaction-services', name: 'Query and Transaction Services', description: 'Drizzle-backed reads, mutations, transactional workflows, reporting, and domain-specific data-access operations.', nodeIds: groups.queries },
  { id: 'layer:database-schema-and-connection', name: 'Database Schema and Connection', description: 'PostgreSQL connection setup plus Drizzle table, relation, enum, index, constraint, and schema barrel definitions.', nodeIds: groups.schema },
  { id: 'layer:types-contracts-and-public-api', name: 'Types, Contracts, and Public API', description: 'Shared TypeScript and Zod contracts together with the package entry point exposed to database consumers.', nodeIds: groups.contracts },
  { id: 'layer:seeding-and-fixtures', name: 'Seeding and Fixtures', description: 'Seed orchestration, reusable seed helpers, and JSON fixture datasets used to populate development and test databases.', nodeIds: groups.seeding },
  { id: 'layer:tests', name: 'Tests', description: 'Regression and synchronization tests covering seed helpers, permission codes, and protected database mutations.', nodeIds: groups.tests },
  { id: 'layer:database-operations-and-tooling', name: 'Database Operations and Tooling', description: 'Package manifests, compiler and lint configuration, migration execution, database initialization SQL, and test-runner configuration.', nodeIds: groups.operations },
  { id: 'layer:documentation', name: 'Documentation', description: 'Schema, setup, taxonomy, and catalog documentation for developers and database operators.', nodeIds: groups.documentation },
];

const expected = new Set(input.fileNodes.map(node => node.id));
const assigned = layers.flatMap(layer => layer.nodeIds);
const counts = assigned.reduce((map, id) => map.set(id, (map.get(id) || 0) + 1), new Map());
const missing = [...expected].filter(id => !counts.has(id));
const duplicates = [...counts].filter(([, count]) => count !== 1);
if (missing.length || duplicates.length || layers.some(layer => layer.nodeIds.length === 0)) {
  throw new Error(`Invalid layers: missing=${JSON.stringify(missing)} duplicates=${JSON.stringify(duplicates)}`);
}
for (const layer of layers) layer.nodeIds.sort();
fs.writeFileSync(`${ua}/intermediate/layers.json`, `${JSON.stringify(layers, null, 2)}\n`);
console.log(JSON.stringify({ expected: expected.size, assigned: assigned.length, layers: layers.map(layer => [layer.id, layer.nodeIds.length]) }));
