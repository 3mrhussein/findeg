import fs from 'node:fs';
import path from 'node:path';

const root = '/Users/amr/projects/findeg/db';
const ua = `${root}/.ua`;
const batches = JSON.parse(fs.readFileSync(`${ua}/intermediate/batches.json`, 'utf8')).batches;

const fileMeta = {
  'seeds/identity.ts': ['Seeds permissions, roles, organizations, users, credentials, authorization grants, memberships, and payment methods while validating fixtures and resolving parent rows.', ['database', 'seed-data', 'identity', 'authorization'], 'complex'],
  'src/queries/catalog/products.ts': ['Provides catalog product reads, search and filtering, variant and taxonomy lookups, enriched views, and product mutations through Drizzle queries.', ['database', 'catalog', 'query-layer', 'data-access'], 'complex'],
  'src/queries/identity/users.ts': ['Implements user, credential, and authorization-context queries plus transactional user and password-credential mutations.', ['database', 'identity', 'authentication', 'data-access'], 'complex'],
  'src/queries/review/reviews.ts': ['Implements product-review retrieval, pagination, aggregate summaries, creation, helpful-vote updates, and product rating recalculation.', ['database', 'reviews', 'query-layer', 'aggregation'], 'complex'],
  'src/queries/sales/__tests__/orders.test.ts': ['Verifies order mutation guards reject immutable payment and reward accounting fields.', ['test', 'orders', 'validation', 'regression'], 'simple'],
  'src/queries/sales/orders.ts': ['Provides order retrieval, filtering, purchase checks, transactional creation and updates, reference-conflict handling, and revenue analytics.', ['database', 'orders', 'transactions', 'analytics'], 'complex'],
  'src/types/index.ts': ['Barrel entry point that re-exports the database package type and validation modules.', ['barrel', 'type-definition', 'entry-point'], 'simple'],
  'src/__tests__/permission-codes.test.ts': ['Checks that seeded permission codes remain synchronized with the canonical identity permission-code definitions.', ['test', 'permissions', 'seed-data', 'validation'], 'simple'],
  'src/queries/catalog/admin-categories.ts': ['Provides administrative category hierarchy reads and category create, update, reorder, and delete operations.', ['database', 'catalog', 'admin', 'hierarchy'], 'complex'],
  'src/queries/catalog/admin-collections.ts': ['Provides administrative collection reads and mutations, including tag assignment and display-order updates.', ['database', 'catalog', 'admin', 'collections'], 'moderate'],
  'src/queries/catalog/admin-tags.ts': ['Provides administrative tag listing, lookup, slug validation, counts, CRUD, and bulk status operations.', ['database', 'catalog', 'admin', 'taxonomy'], 'moderate'],
  'src/types/common.ts': ['Defines shared Zod schemas and inferred types for locales, money, identifiers, slugs, quantities, ratings, and media assets.', ['type-definition', 'validation', 'zod', 'shared-types'], 'moderate'],
  'src/types/identity.ts': ['Defines identity and session schemas, canonical permission and role constants, user value-object construction, and authorization predicates.', ['type-definition', 'identity', 'authorization', 'validation'], 'complex'],
  'src/types/pricing.ts': ['Defines Zod schemas for persisted prices, discount rules, applied discounts, and resolved pricing results.', ['type-definition', 'pricing', 'validation', 'zod'], 'moderate'],
  'src/queries/school-directory/index.ts': ['Implements partner-school directory filtering, search, facet options, and detailed lookup by school code.', ['database', 'school-directory', 'search', 'data-access'], 'moderate'],
  'src/queries/school-supply-lists/index.ts': ['Finds product variant candidates for supply-list items and derives category attribute values for matching workflows.', ['database', 'school-supply-lists', 'product-matching', 'data-access'], 'moderate'],
  'src/queries/school-supply-lists/lifecycle.ts': ['Implements transactional school-supply-list lifecycle operations, including locking, drafts, items, snapshots, publication, archival, and conflict detection.', ['database', 'school-supply-lists', 'transactions', 'lifecycle'], 'complex'],
  'src/queries/school-supply-lists/list-offers.ts': ['Reads, upserts, deletes, and copies commercial offer terms associated with school supply lists.', ['database', 'school-supply-lists', 'offers', 'transactions'], 'moderate'],
  'src/queries/school-supply-lists/public-read.ts': ['Builds public supply-list views and resolves inventory availability and product-variant display details.', ['database', 'school-supply-lists', 'public-read', 'inventory'], 'moderate'],
  'src/types/school-supply-lists.ts': ['Defines identifiers and Zod validation schemas for supply-list drafts, items, and list offers.', ['type-definition', 'school-supply-lists', 'validation', 'zod'], 'moderate'],
  'docs/SCHEMA.md': ['Database schema reference covering the global entity relationship model, feature-specific tables, complex types, and migration commands.', ['documentation', 'database', 'schema-reference', 'er-diagram'], 'moderate'],
  'docs/SETUP.md': ['Docker-based database setup guide covering startup scripts, connection details, troubleshooting, and direct PostgreSQL access.', ['documentation', 'database', 'docker', 'setup'], 'moderate'],
  'docs/TAXONOMY.md': ['Explains the hybrid catalog taxonomy across tags, collections, attributes, and smart supply-list matching.', ['documentation', 'catalog', 'taxonomy', 'product-matching'], 'moderate'],
};

const words = name => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase();
function functionSummary(name) {
  const phrase = words(name);
  if (/^(get|find|list|search|count|has|check|is)/.test(name)) return `Queries or evaluates database state to ${phrase}.`;
  if (/^(create|insert)/.test(name)) return `Creates persisted state to ${phrase}.`;
  if (/^(update|upsert|set|reorder|mark|recalculate|snapshot)/.test(name)) return `Updates persisted state to ${phrase}.`;
  if (/^(delete|archive)/.test(name)) return `Removes or retires persisted state to ${phrase}.`;
  if (/^(publish|copy|lock|seed)/.test(name)) return `Coordinates database work to ${phrase}.`;
  return `Implements the ${phrase} operation for this module.`;
}
function functionTags(name, file) {
  const tags = ['database', 'query-function'];
  if (/create|insert|update|upsert|delete|archive|publish|mark|recalculate|set|reorder|copy|seed/i.test(name)) tags.push('mutation');
  else tags.push('read-operation');
  if (file.includes('identity')) tags.push('identity');
  else if (file.includes('school-supply')) tags.push('school-supply-lists');
  else if (file.includes('catalog')) tags.push('catalog');
  else if (file.includes('orders')) tags.push('orders');
  else if (file.includes('review')) tags.push('reviews');
  else tags.push('data-access');
  return tags.slice(0, 5);
}
function complexity(lines) { return lines > 200 ? 'complex' : lines >= 50 ? 'moderate' : 'simple'; }

for (const batch of batches.filter(b => b.batchIndex >= 6 && b.batchIndex <= 9)) {
  const extracted = JSON.parse(fs.readFileSync(`${ua}/tmp/ua-file-extract-results-${batch.batchIndex}.json`, 'utf8'));
  const nodes = [];
  const edges = [];
  const nodeIds = new Set();
  for (const result of extracted.results) {
    const [summary, tags, rated] = fileMeta[result.path];
    const type = result.fileCategory === 'docs' ? 'document' : 'file';
    const fileId = `${type}:${result.path}`;
    nodes.push({ id: fileId, type, name: path.basename(result.path), filePath: result.path, summary, tags, complexity: rated });
    nodeIds.add(fileId);
    if (result.fileCategory === 'code') {
      const exported = new Set((result.exports || []).map(e => e.name));
      for (const fn of result.functions || []) {
        const lineCount = fn.endLine - fn.startLine + 1;
        if (lineCount < 10 && !exported.has(fn.name)) continue;
        const id = `function:${result.path}:${fn.name}`;
        nodes.push({ id, type: 'function', name: fn.name, filePath: result.path, lineRange: [fn.startLine, fn.endLine], summary: functionSummary(fn.name), tags: functionTags(fn.name, result.path), complexity: complexity(lineCount) });
        nodeIds.add(id);
        edges.push({ source: fileId, target: id, type: 'contains', direction: 'forward', weight: 1.0 });
        if (exported.has(fn.name)) edges.push({ source: fileId, target: id, type: 'exports', direction: 'forward', weight: 0.8 });
      }
      for (const target of batch.batchImportData[result.path] || []) {
        edges.push({ source: fileId, target: `file:${target}`, type: 'imports', direction: 'forward', weight: 0.7 });
      }
      for (const call of result.callGraph || []) {
        const source = `function:${result.path}:${call.caller}`;
        const target = `function:${result.path}:${call.callee}`;
        if (source !== target && nodeIds.has(source) && nodeIds.has(target) && !edges.some(e => e.source === source && e.target === target && e.type === 'calls')) {
          edges.push({ source, target, type: 'calls', direction: 'forward', weight: 0.8 });
        }
      }
      if (result.path.includes('/__tests__/')) {
        for (const target of batch.batchImportData[result.path] || []) {
          if (!target.includes('/__tests__/') && extracted.results.some(candidate => candidate.path === target)) {
            edges.push({ source: `file:${target}`, target: fileId, type: 'tested_by', direction: 'forward', weight: 0.5 });
          }
        }
      }
    }
  }
  const fragment = { nodes, edges };
  const out = `${ua}/intermediate/batch-${batch.batchIndex}.json`;
  fs.writeFileSync(out, `${JSON.stringify(fragment, null, 2)}\n`);
}
