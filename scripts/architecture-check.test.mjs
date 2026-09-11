import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { chmod, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, test } from 'node:test';
import { runArchitectureCheck } from './architecture-check.mjs';

const temporaryRoots = [];
const executeFile = promisify(execFile);

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })));
});

async function createTargetRepository() {
  const root = await mkdtemp(join(tmpdir(), 'findeg-architecture-check-'));
  temporaryRoots.push(root);

  await Promise.all([
    mkdir(join(root, 'docs/architecture'), { recursive: true }),
    mkdir(join(root, 'docs/adr'), { recursive: true }),
    mkdir(join(root, 'docs/contracts/openapi'), { recursive: true }),
    mkdir(join(root, 'docs/operations'), { recursive: true }),
    mkdir(join(root, 'frontend/storefront/src'), { recursive: true }),
    mkdir(join(root, 'backend/src/features/catalog'), { recursive: true }),
    mkdir(join(root, 'backend/src/modules'), { recursive: true }),
    mkdir(join(root, 'backend/src/application'), { recursive: true }),
    mkdir(join(root, 'runtime/src'), { recursive: true }),
    mkdir(join(root, 'db/src'), { recursive: true }),
  ]);

  await Promise.all([
    writeFile(join(root, 'CONTEXT.md'), '# FindEg\n'),
    writeFile(join(root, 'README.md'), '# Historical repository overview\n'),
    writeFile(join(root, 'docs/architecture/README.md'), '# Target architecture\n'),
    writeFile(join(root, 'docs/adr/0001-target-architecture.md'), '# ADR\n'),
    writeFile(join(root, 'docs/contracts/openapi/v1.yaml'), 'openapi: 3.1.0\n'),
    writeFile(join(root, 'docs/operations/README.md'), '# Operations\n'),
    writeFile(join(root, 'docs/package-guidance.md'), '# Package guidance\n'),
  ]);

  return root;
}

function runArchitectureCheckCommand(root) {
  return executeFile(process.execPath, ['scripts/architecture-check.mjs', '--root', root], {
    cwd: process.cwd(),
  });
}

test('accepts the canonical documentation set without prohibited dependencies', async () => {
  const root = await createTargetRepository();

  const result = await runArchitectureCheckCommand(root);
  assert.equal(result.stderr, '');
});

test('reports documentation drift and prohibited module dependencies', async () => {
  const root = await createTargetRepository();
  await Promise.all([
    rm(join(root, 'docs/contracts/openapi/v1.yaml')),
    writeFile(join(root, 'frontend/storefront/src/products.ts'), 'import "@findeg/db";\n'),
    writeFile(
      join(root, 'frontend/storefront/src/catalog.ts'),
      'import { repository } from "@findeg/backend/features/catalog/infrastructure";\n',
    ),
    writeFile(
      join(root, 'backend/src/features/catalog/cache.ts'),
      'export { cache } from "next/cache";\n',
    ),
    writeFile(join(root, 'db/src/queries.ts'), 'await import("@findeg/backend");\n'),
    writeFile(join(root, 'README.md'), 'This is the single source of truth for architecture.\n'),
  ]);

  await assert.rejects(runArchitectureCheckCommand(root), (error) => {
    assert.equal(error.code, 1);
    assert.deepEqual(error.stderr.trim().split('\n'), [
      'Historical document claims canonical authority: README.md',
      'Missing canonical documentation: docs/contracts/openapi/v1.yaml',
      'Prohibited dependency: backend/src/features/catalog/cache.ts imports next/cache',
      'Prohibited dependency: db/src/queries.ts imports @findeg/backend',
      'Prohibited dependency: frontend/storefront/src/catalog.ts imports @findeg/backend/features/catalog/infrastructure',
      'Prohibited dependency: frontend/storefront/src/products.ts imports @findeg/db',
    ]);
    return true;
  });
});

test('reports unresolved Git merge markers in repository-owned Markdown as documentation drift', async () => {
  const root = await createTargetRepository();
  await writeFile(
    join(root, 'docs/legacy-notes.md'),
    [
      '<<<<<<< HEAD',
      'Historical prototype note.',
      '=======',
      'Alternate prototype note.',
      '>>>>>>> legacy',
    ].join('\n'),
  );

  assert.deepEqual(await runArchitectureCheck(root), [
    'Documentation drift: unresolved Git merge marker: docs/legacy-notes.md',
  ]);
});

test('reports CommonJS require forms of every prohibited dependency direction', async () => {
  const root = await createTargetRepository();
  await Promise.all([
    writeFile(join(root, 'frontend/storefront/src/products.cjs'), 'require("@findeg/db");\n'),
    writeFile(
      join(root, 'frontend/storefront/src/catalog.cjs'),
      'require("@findeg/backend/features/catalog/infrastructure");\n',
    ),
    writeFile(join(root, 'backend/src/features/catalog/cache.cjs'), 'require("next/cache");\n'),
    writeFile(join(root, 'db/src/queries.cjs'), 'require("@findeg/backend");\n'),
  ]);

  assert.deepEqual(await runArchitectureCheck(root), [
    'Prohibited dependency: backend/src/features/catalog/cache.cjs imports next/cache',
    'Prohibited dependency: db/src/queries.cjs imports @findeg/backend',
    'Prohibited dependency: frontend/storefront/src/catalog.cjs imports @findeg/backend/features/catalog/infrastructure',
    'Prohibited dependency: frontend/storefront/src/products.cjs imports @findeg/db',
  ]);
});

test('fails closed when a required source root is missing or unreadable', async () => {
  const missingRoot = await createTargetRepository();
  await rm(join(missingRoot, 'backend/src/features'), { recursive: true });

  assert.deepEqual(await runArchitectureCheck(missingRoot), [
    'Required source root is missing or unreadable: backend/src/features',
  ]);

  const unreadableRoot = await createTargetRepository();
  const frontendRoot = join(unreadableRoot, 'frontend');
  await chmod(frontendRoot, 0o000);
  try {
    assert.deepEqual(await runArchitectureCheck(unreadableRoot), [
      'Required source root is missing or unreadable: frontend',
    ]);
  } finally {
    await chmod(frontendRoot, 0o755);
  }
});

async function source(root, path, contents) {
  await mkdir(join(root, path, '..'), { recursive: true });
  await writeFile(join(root, path), contents);
}

test('rejects cross-owner internals, database leaks, and relative import bypasses', async () => {
  const root = await createTargetRepository();
  await source(root, 'backend/src/modules/catalog/contracts.ts', 'export interface Product {}');
  await source(
    root,
    'backend/src/modules/catalog/infrastructure/store.ts',
    'export const store = {};',
  );
  await source(
    root,
    'backend/src/modules/commerce/public.ts',
    `
    import { store } from '../catalog/infrastructure/store.js';
    import type { Product } from '../catalog/contracts.js';
    import { users } from '../../../../db/src/schema/identity/users.js';
    import { drizzle } from 'drizzle-orm/postgres-js';
  `,
  );
  const violations = await runArchitectureCheck(root);
  assert.ok(violations.some((message) => message.includes('catalog/infrastructure/store.js')));
  assert.ok(violations.some((message) => message.includes('db/src/schema/identity/users.js')));
  assert.ok(violations.some((message) => message.includes('drizzle-orm/postgres-js')));
  assert.ok(!violations.some((message) => message.includes('catalog/contracts.js')));
});

test('rejects cycles through otherwise permitted module contracts', async () => {
  const root = await createTargetRepository();
  await source(
    root,
    'backend/src/modules/catalog/contracts.ts',
    "export type { Order } from '../commerce/contracts.js';",
  );
  await source(
    root,
    'backend/src/modules/commerce/contracts.ts',
    "export type { Product } from '../catalog/contracts.js';",
  );
  assert.ok(
    (await runArchitectureCheck(root)).some((message) =>
      message.includes('Module dependency cycle:'),
    ),
  );
});

test('permits runtime construction and same-owner persistence while rejecting another owner schema', async () => {
  const root = await createTargetRepository();
  await source(root, 'db/src/modules/catalog/schema.ts', 'export const products = {};');
  await source(root, 'db/src/modules/commerce/schema.ts', 'export const orders = {};');
  await source(
    root,
    'backend/src/modules/catalog/infrastructure/store.ts',
    `
    import { products } from '../../../../../db/src/modules/catalog/schema.js';
    import type { TransactionDatabase } from '@findeg/db/transactions';
    import { eq } from 'drizzle-orm';
  `,
  );
  await source(
    root,
    'runtime/src/compose.ts',
    "import { store } from '../../backend/src/modules/catalog/infrastructure/store.js';",
  );
  assert.deepEqual(await runArchitectureCheck(root), []);
  await source(
    root,
    'backend/src/modules/catalog/infrastructure/foreign-store.ts',
    "import { orders } from '../../../../../db/src/modules/commerce/schema.js';",
  );
  assert.ok(
    (await runArchitectureCheck(root)).some((message) => message.includes('commerce/schema.js')),
  );
});

test('follows configured aliases and type imports instead of allowing boundary bypasses', async () => {
  const root = await createTargetRepository();
  await source(
    root,
    'tsconfig.json',
    JSON.stringify({
      compilerOptions: {
        baseUrl: '.',
        paths: { '@storage/*': ['db/src/*'], '@modules/*': ['backend/src/modules/*'] },
      },
    }),
  );
  await source(root, 'db/src/connection.ts', 'export const db = {};');
  await source(
    root,
    'backend/src/modules/catalog/infrastructure/store.ts',
    'export const store = {};',
  );
  await source(
    root,
    'backend/src/modules/commerce/contracts.ts',
    `
    export { db } from '@storage/connection';
    export { store } from '@modules/catalog/infrastructure/store';
    export type Query = import('drizzle-orm').SQL;
  `,
  );
  const violations = await runArchitectureCheck(root);
  for (const imported of [
    '@storage/connection',
    '@modules/catalog/infrastructure/store',
    'drizzle-orm',
  ]) {
    assert.ok(
      violations.some((message) => message.includes(imported)),
      imported,
    );
  }
});

test('fails closed on computed target dependencies and unknown module owners', async () => {
  const root = await createTargetRepository();
  await source(root, 'backend/src/modules/unregistered/public.ts', 'await import(modulePath);');
  const violations = await runArchitectureCheck(root);
  assert.ok(violations.some((message) => message.includes('Unknown module owner:')));
  assert.ok(violations.some((message) => message.includes('Nonliteral module dependency:')));
});

test('prevents coordination and database barrels from hiding cross-owner dependencies', async () => {
  const root = await createTargetRepository();
  await source(root, 'backend/src/application/checkout.ts', 'export const checkout = {};');
  await source(root, 'db/src/runtime/schema.ts', 'export const allTables = {};');
  await source(root, 'db/src/queries/orders.ts', 'export const orders = {};');
  await source(
    root,
    'backend/src/modules/catalog/public.ts',
    "import { checkout } from '../../application/checkout.js';",
  );
  await source(
    root,
    'db/src/modules/catalog/adapter.ts',
    "import { orders } from '../../queries/orders.js';",
  );
  await source(
    root,
    'db/src/modules/catalog/schema.ts',
    "export { allTables } from '../../runtime/schema.js';",
  );
  const violations = await runArchitectureCheck(root);
  for (const imported of ['application/checkout.js', 'queries/orders.js', 'runtime/schema.js']) {
    assert.ok(
      violations.some((message) => message.includes(imported)),
      imported,
    );
  }
});
