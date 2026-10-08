import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyClientBundle } from './client-bundle.mjs';

test('rejects a server dependency in an emitted client chunk, including indexed source maps', async (t) => {
  const build = await mkdtemp(join(tmpdir(), 'storefront-bundle-'));
  t.after(() => rm(build, { recursive: true, force: true }));
  const chunks = join(build, 'static/chunks');
  await mkdir(chunks, { recursive: true });
  await writeFile(
    join(chunks, 'checkout.js'),
    'minified code\n//# sourceMappingURL=hashed-sources.js.map',
  );
  await writeFile(
    join(chunks, 'hashed-sources.js.map'),
    JSON.stringify({
      version: 3,
      sections: [
        {
          offset: { line: 0, column: 0 },
          map: {
            version: 3,
            sources: [
              'turbopack:///[project]/node_modules/.pnpm/postgres@3.4.9/node_modules/postgres/src/index.js',
            ],
            names: [],
            mappings: '',
          },
        },
      ],
    }),
  );
  await assert.rejects(verifyClientBundle(build), /checkout\.js.*postgres/s);
});

async function fixture(t, moduleSources) {
  const build = await mkdtemp(join(tmpdir(), 'storefront-bundle-'));
  t.after(() => rm(build, { recursive: true, force: true }));
  await mkdir(join(build, 'static/chunks/nested'), { recursive: true });
  await writeFile(
    join(build, 'static/chunks/nested/cart.js'),
    'minified code\n//# sourceMappingURL=cart.js.map',
  );
  await writeFile(
    join(build, 'static/chunks/nested/cart.js.map'),
    JSON.stringify({
      version: 3,
      sources: moduleSources,
      names: [],
      mappings: '',
    }),
  );
  return build;
}

test('allows client schemas and UI while ignoring server output and package names in content', async (t) => {
  const build = await fixture(t, [
    'turbopack:///[project]/backend/src/features/order/schemas.ts',
    'turbopack:///[project]/frontend/storefront/src/components/cart.tsx',
    'turbopack:///[project]/node_modules/zod/index.js',
    'turbopack:///[project]/db/src/types/sales.ts',
  ]);
  await mkdir(join(build, 'server'), { recursive: true });
  await writeFile(join(build, 'server/page.js'), 'postgres nodemailer');
  assert.equal(await verifyClientBundle(build), 1);
});

for (const source of [
  '/project/db/src/connection.ts',
  'C:\\project\\backend\\src\\features\\notifications\\infrastructure\\email.ts',
  '/project/node_modules/drizzle-orm/index.js',
  '/project/node_modules/bcryptjs/index.js',
  '/project/node_modules/jsonwebtoken/index.js',
  '/project/node_modules/nodemailer/lib/index.js',
  '/project/node_modules/sharp/lib/index.js',
  'node:fs',
  'node:crypto',
]) {
  test(`rejects ${source} in client output`, async (t) => {
    const build = await fixture(t, [source]);
    await assert.rejects(verifyClientBundle(build), /Server modules in client chunk/);
  });
}

test('fails closed when the build, JavaScript, or module evidence is missing', async (t) => {
  const build = await fixture(t, []);
  await assert.rejects(verifyClientBundle(build), /no module sources/);
  await rm(join(build, 'static/chunks/nested/cart.js.map'));
  await assert.rejects(verifyClientBundle(build), /ENOENT/);
  await rm(join(build, 'static/chunks/nested/cart.js'));
  await assert.rejects(verifyClientBundle(build), /No emitted client JavaScript/);
  await rm(join(build, 'static/chunks'), { recursive: true });
  await assert.rejects(verifyClientBundle(build), /ENOENT/);
});

test('allows the exact framework polyfill but rejects unmapped modifications', async (t) => {
  const build = await fixture(t, ['client.ts']);
  const path = join(build, 'static/chunks/nested/cart.js');
  await writeFile(path, 'framework polyfill');
  assert.equal(await verifyClientBundle(build, { frameworkPolyfill: 'framework polyfill' }), 1);
  await writeFile(path, 'framework polyfill; server dependency');
  await assert.rejects(
    verifyClientBundle(build, { frameworkPolyfill: 'framework polyfill' }),
    /Missing local source map/,
  );
});
