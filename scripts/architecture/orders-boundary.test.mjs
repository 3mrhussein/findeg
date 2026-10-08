import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const storefrontRequire = createRequire(new URL('frontend/storefront/package.json', root));
const backendRequire = createRequire(new URL('backend/package.json', root));

async function lintAt(relativeFile, code) {
  const absolute = fileURLToPath(new URL(relativeFile, root));
  const backendFile = relativeFile.startsWith('backend/');
  const { ESLint } = (backendFile ? backendRequire : storefrontRequire)('eslint');
  const config = fileURLToPath(
    new URL(
      backendFile ? 'backend/eslint.config.js' : 'frontend/storefront/eslint.config.js',
      root,
    ),
  );
  const eslint = new ESLint({ cwd: fileURLToPath(root), overrideConfigFile: config });
  const [result] = await eslint.lintText(code, { filePath: absolute });
  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
  return result.messages
    .filter((message) => message.ruleId === 'local/orders-boundary')
    .map((message) => message.messageId);
}

test('Orders consumers may use only the three public package entries', async () => {
  for (const entry of ['@findeg/orders', '@findeg/orders/schemas', '@findeg/orders/events']) {
    assert.deepEqual(await lintAt('frontend/storefront/src/boundary.ts', `import '${entry}';`), []);
  }
});

test('rejects deep aliases and relative filesystem bypasses, including dynamic and type imports', async () => {
  const fixture = 'frontend/storefront/src/boundary.ts';
  for (const code of [
    "import '@findeg/orders/src/application/factory';",
    "export { x } from '@findeg/orders/internal/thing';",
    "const module = import('@findeg/orders/src/index');",
    "type Orders = import('@findeg/orders/src/index').Orders;",
    "import '../../../packages/orders/src/index';",
    "const module = import('../../../packages/orders/src/index');",
    'const module = import(`../../../packages/orders/src/index`);',
    "const module = require('@findeg/orders/src/index');",
    'const module = require(`@findeg/orders/src/index`);',
    "type Orders = import('../../../packages/orders/src/index').Orders;",
    "import '../../../backend/src/features/order/application/factory';",
    "import '@findeg/backend/features/order/application/services/OrderService';",
  ]) {
    assert.notDeepEqual(await lintAt(fixture, code), [], code);
  }
});

test('Orders has no Backend, app, or Next dependency, including type and dynamic imports', async () => {
  for (const code of [
    "import type { Order } from '@findeg/backend/features/core';",
    "const app = import('@findeg/dashboard/server');",
    "type Page = import('next').Metadata;",
    "import '../../../backend/src/features/core';",
    "type Page = import('../../../frontend/dashboard/src/page').Page;",
  ]) {
    assert.ok((await lintAt('packages/orders/src/index.ts', code)).includes('forbidden'), code);
  }
});

test('Backend consumers cannot reach legacy Order internals after extraction', async () => {
  assert.deepEqual(
    await lintAt(
      'backend/src/features/identity/application/service.ts',
      "import '../../order/domain/entities/Order';",
    ),
    ['relative'],
  );
});

test('the current public Orders compatibility entries remain usable until extraction', async () => {
  assert.deepEqual(
    await lintAt(
      'frontend/dashboard/src/components/orders.tsx',
      "import { getAllowedOrderStatusTransitions } from '@findeg/backend/features/order/schemas';",
    ),
    [],
  );
});

test('workspace dependency graph has no runtime, type, or development cycles', async () => {
  const candidates = [
    'packages/config',
    'packages/env',
    'packages/money',
    'packages/domain-errors',
    'packages/orders',
    'db',
    'backend',
    'frontend/ui',
    'frontend/storefront',
    'frontend/dashboard',
  ];
  const packageDirs = [];
  for (const directory of candidates) {
    try {
      await access(new URL(`${directory}/package.json`, root));
      packageDirs.push(directory);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const manifests = await Promise.all(
    packageDirs.map(async (directory) => [
      directory,
      JSON.parse(await readFile(new URL(`${directory}/package.json`, root), 'utf8')),
    ]),
  );
  const names = new Map(manifests.map(([directory, manifest]) => [manifest.name, directory]));
  const graph = new Map(
    manifests.map(([directory, manifest]) => {
      const dependencies = [
        'dependencies',
        'devDependencies',
        'optionalDependencies',
        'peerDependencies',
      ]
        .flatMap((kind) => Object.keys(manifest[kind] ?? {}))
        .filter((name) => names.has(name))
        .map((name) => names.get(name));
      return [directory, dependencies];
    }),
  );
  const active = new Set();
  const complete = new Set();
  function visit(directory, chain = []) {
    assert.ok(
      !active.has(directory),
      `workspace dependency cycle: ${[...chain, directory].join(' -> ')}`,
    );
    if (complete.has(directory)) return;
    active.add(directory);
    for (const dependency of graph.get(directory) ?? []) visit(dependency, [...chain, directory]);
    active.delete(directory);
    complete.add(directory);
  }
  for (const directory of graph.keys()) visit(directory);
});

test('if the extracted package exists, its export map and dependency direction are exact', async () => {
  let manifest;
  try {
    manifest = JSON.parse(await readFile(new URL('packages/orders/package.json', root), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return; // Extraction is delivered by the dependent issues.
    throw error;
  }
  assert.deepEqual(Object.keys(manifest.exports ?? {}).sort(), ['.', './events', './schemas']);
  const dependencies = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ].flatMap((kind) => Object.keys(manifest[kind] ?? {}));
  assert.ok(
    !dependencies.some((name) =>
      ['@findeg/backend', '@findeg/dashboard', '@findeg/storefront', 'next'].includes(name),
    ),
  );
  for (const dependency of ['@findeg/money', '@findeg/domain-errors', '@findeg/db']) {
    assert.equal(
      manifest.dependencies?.[dependency],
      'workspace:*',
      `${dependency} must be direct`,
    );
  }
});
