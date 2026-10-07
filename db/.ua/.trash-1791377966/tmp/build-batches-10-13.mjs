import fs from 'node:fs';

const root = '/Users/amr/projects/findeg/db';
const ua = `${root}/.ua`;
const batches = JSON.parse(fs.readFileSync(`${ua}/intermediate/batches.json`, 'utf8')).batches;

const purpose = {
  'addresses': 'Address fixtures for customer and order-delivery scenarios.',
  'alternatives': 'Placeholder fixture set for product alternatives; currently empty.',
  'attributes': 'Catalog attribute-definition fixtures used to describe product characteristics.',
  'audit_log': 'Audit-event fixtures for system activity and administrative history.',
  'auth_accounts': 'Authentication-account fixtures linking identities to login providers.',
  'brands': 'Brand fixtures covering the catalog manufacturers represented in seeded products.',
  'categories': 'Hierarchical catalog category fixtures used to organize the seeded assortment.',
  'collection_tags': 'Join fixtures associating curated collections with catalog tags.',
  'collections': 'Curated catalog collection fixtures and their presentation metadata.',
  'discount_rules': 'Sales discount-rule fixtures used by pricing and checkout scenarios.',
  'guest_principals': 'Guest identity fixtures supporting unauthenticated checkout flows.',
  'inventory_balances': 'Warehouse-level inventory balance fixtures for seeded product variants.',
  'list_items': 'Placeholder fixture set for list items; currently empty.',
  'order_items': 'Order-line fixtures connecting seeded orders to purchased variants.',
  'orders': 'Sales order fixtures for checkout and fulfillment scenarios.',
  'organization_memberships': 'Membership fixtures linking users to organizations and roles.',
  'organizations': 'Organization fixtures for tenant and membership scenarios.',
  'password_credentials': 'Password credential fixtures for seeded local authentication accounts.',
  'payment_methods': 'Payment-method fixtures attached to seeded identities.',
  'permissions': 'Canonical permission-code fixtures used by role-based access control.',
  'product_attributes': 'Product-level attribute value fixtures for catalog filtering and display.',
  'product_images': 'Placeholder fixture set for product images; currently empty.',
  'product_tags': 'Join fixtures assigning search and merchandising tags to products.',
  'product_variants': 'SKU-level variant fixtures containing purchasable catalog combinations.',
  'products': 'Core product fixtures containing the seeded catalog assortment and localized content.',
  'review_helpful_votes': 'Placeholder fixture set for review helpfulness votes; currently empty.',
  'reviews': 'Product review fixtures for rating and feedback scenarios.',
  'role_permissions': 'Role-to-permission assignment fixtures defining baseline authorization policy.',
  'roles': 'Role fixtures used by identity and authorization scenarios.',
  'search_logs': 'Search-event fixtures for analytics and system-observability scenarios.',
  'stock_movements': 'Inventory movement fixtures recording seeded stock changes.',
  'tags': 'Catalog tag fixtures used for discovery, grouping, and merchandising.',
  'user_permissions': 'Per-user permission override fixtures.',
  'user_roles': 'User-to-role assignment fixtures for seeded authorization states.',
  'users': 'User identity fixtures covering administrative and customer accounts.',
  'variant_attributes': 'Variant-level attribute fixtures describing SKU combinations.',
  'variant_images': 'Variant image fixtures associating media with specific SKUs.',
  'warehouses': 'Warehouse fixtures used as inventory storage locations.',
};

const special = {
  'init-db.sql': ['file', 'Initializes a fresh PostgreSQL database by enabling the uuid-ossp extension before Drizzle migrations create tables.', ['database', 'initialization', 'postgresql'], 'simple'],
  'package.json': ['config', 'Defines the @findeg/db package exports, database lifecycle scripts, and runtime and development dependencies.', ['configuration', 'package-manifest', 'database'], 'moderate'],
  'tsconfig.json': ['config', 'Configures no-emit TypeScript checking and @findeg/db path aliases while excluding migrations and tests.', ['configuration', 'typescript', 'build-system'], 'simple'],
  'drizzle.config.ts': ['file', 'Configures Drizzle Kit for the project PostgreSQL schemas, migration output directory, and environment-backed connection URL.', ['configuration', 'drizzle', 'database'], 'simple'],
  'eslint.config.js': ['file', 'Re-exports the shared database ESLint preset for this package.', ['configuration', 'eslint', 'barrel'], 'simple'],
  'migrate.ts': ['file', 'Runs pending Drizzle migrations only when the explicit migration safety flag is enabled, then closes the database connection.', ['entry-point', 'migration', 'database'], 'simple'],
  'seed.test.ts': ['file', 'Verifies the seed command executes every domain stage in order, reports failures, and always closes the database connection.', ['test', 'database', 'lifecycle'], 'moderate'],
  'seeds/helpers/constants.ts': ['file', 'Defines the dependency-safe table import order used by seed helpers.', ['configuration', 'seeding', 'database'], 'simple'],
  'src/index.ts': ['file', 'Public package entry point that exposes only schemas and types, keeping runtime database connections out of client-safe imports.', ['entry-point', 'barrel', 'type-definition'], 'simple'],
  'src/queries/catalog/index.ts': ['file', 'Catalog query barrel exposing product, category, brand, collection, tag, search, analytics, and inventory operations.', ['barrel', 'database', 'catalog'], 'moderate'],
  'src/queries/identity/index.ts': ['file', 'Identity query barrel exposing admin-user, role, and permission-management operations and their input/result types.', ['barrel', 'database', 'identity'], 'simple'],
  'src/queries/index.ts': ['file', 'Top-level query barrel organizing domain primitives, feature-specific operations, transaction helpers, and namespaced query groups.', ['entry-point', 'barrel', 'database'], 'simple'],
  'src/queries/inventory/index.ts': ['file', 'Inventory query barrel for low-stock reporting and transactional stock reservation lifecycle operations.', ['barrel', 'database', 'inventory'], 'simple'],
  'src/queries/products/index.ts': ['file', 'Administrative product query barrel covering listing, creation, duplication, bulk actions, variants, images, and availability checks.', ['barrel', 'database', 'catalog'], 'simple'],
  'src/queries/sales/index.ts': ['file', 'Sales query barrel exposing order statistics, revenue reporting, purchase checks, checkout idempotency, and guest access.', ['barrel', 'database', 'sales'], 'simple'],
  'src/schema/catalog/README.md': ['document', 'Documents the catalog schema architecture, entity relationships, twelve core tables, cross-schema references, and data flow.', ['documentation', 'database', 'schema-definition'], 'complex'],
  'src/schema/identity/index.ts': ['file', 'Identity schema barrel exporting access-control, user, and partner table definitions.', ['barrel', 'schema-definition', 'identity'], 'simple'],
  'src/schema/school-engine/index.ts': ['file', 'School-engine schema barrel exporting school supply list definitions.', ['barrel', 'schema-definition', 'school-engine'], 'simple'],
  'src/schema/system/index.ts': ['file', 'System schema barrel exporting audit, logging, notification, search-log, and outbox definitions.', ['barrel', 'schema-definition', 'system'], 'simple'],
  'src/types/catalog/IProduct.interface.ts': ['file', 'Defines the legacy product contract with localized content, media variants, catalog relations, and rating metadata.', ['type-definition', 'catalog', 'data-model'], 'simple'],
  'vitest.config.ts': ['file', 'Configures Vitest for Node-based database tests with isolated local PostgreSQL environment values.', ['configuration', 'test', 'vitest'], 'simple'],
};

function nodeFor(file, lines) {
  const path = file.path;
  if (special[path]) {
    const [type, summary, tags, complexity] = special[path];
    return { id: `${type}:${path}`, type, name: path.split('/').at(-1), filePath: path, summary, tags, complexity };
  }
  const stem = path.split('/').at(-1).replace(/\.json$/, '');
  return {
    id: `config:${path}`,
    type: 'config',
    name: path.split('/').at(-1),
    filePath: path,
    summary: purpose[stem] || `Seed fixture data for ${stem.replaceAll('_', ' ')} records.`,
    tags: ['configuration', 'seed-data', 'database'],
    complexity: lines > 200 ? 'complex' : lines >= 50 ? 'moderate' : 'simple',
  };
}

for (const index of [10, 11, 12, 13]) {
  const batch = batches.find((x) => x.batchIndex === index);
  const extract = JSON.parse(fs.readFileSync(`${ua}/tmp/ua-file-extract-results-${index}.json`, 'utf8'));
  const lineMap = new Map(extract.results.map((x) => [x.path, x.nonEmptyLines]));
  const nodes = batch.files.map((f) => nodeFor(f, lineMap.get(f.path) ?? f.sizeLines));
  const edges = [];
  for (const file of batch.files) {
    for (const target of batch.batchImportData[file.path] || []) {
      edges.push({ source: `file:${file.path}`, target: `file:${target}`, type: 'imports', direction: 'forward', weight: 0.7 });
    }
  }
  for (const [path, neighbors] of Object.entries(batch.neighborMap || {})) {
    if (!path.startsWith('seeds/data/')) continue;
    for (const neighbor of neighbors) {
      if (neighbor.symbols?.[0]) edges.push({ source: `config:${path}`, target: `function:${neighbor.path}:${neighbor.symbols[0]}`, type: 'configures', direction: 'forward', weight: 0.6 });
    }
  }
  if (index === 10) {
    edges.push({ source: 'config:package.json', target: 'file:src/index.ts', type: 'configures', direction: 'forward', weight: 0.6 });
    edges.push({ source: 'config:tsconfig.json', target: 'file:src/index.ts', type: 'configures', direction: 'forward', weight: 0.6 });
  }
  fs.writeFileSync(`${ua}/intermediate/batch-${index}.json`, `${JSON.stringify({ nodes, edges }, null, 2)}\n`);
}
