import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const wrapper = new URL('./build-next-app.mjs', import.meta.url);

async function fixture(t) {
  const app = await mkdtemp(join(tmpdir(), 'next-build-env-'));
  t.after(() => rm(app, { recursive: true, force: true }));
  await writeFile(join(app, 'package.json'), '{"private":true}');
  const next = join(app, 'node_modules/next');
  await mkdir(join(next, 'dist/bin'), { recursive: true });
  await mkdir(join(next, 'dist/build/polyfills'), { recursive: true });
  await writeFile(join(next, 'package.json'), '{"name":"next"}');
  await writeFile(join(next, 'dist/build/polyfills/polyfill-nomodule.js'), 'framework polyfill');
  // Exercise the real wrapper and its real child process without compiling an app.
  await writeFile(
    join(next, 'dist/bin/next.js'),
    `const fs = require('node:fs');
fs.writeFileSync('child.json', JSON.stringify({
  mode: process.env.NODE_ENV,
  verify: process.env.VERIFY_CLIENT_BUNDLE,
  inherited: process.env.BUILD_ENV_FIXTURE,
  args: process.argv.slice(2),
}));
fs.mkdirSync('.next/static/chunks/nested', { recursive: true });
fs.writeFileSync('.next/static/chunks/nested/app.js', 'client code\\n//# sourceMappingURL=app.js.map');
fs.writeFileSync('.next/static/chunks/nested/app.js.map', JSON.stringify({
  version: 3, sources: [process.env.FIXTURE_SOURCE || 'client.ts'], names: [], mappings: '',
}));
process.exit(Number(process.env.FIXTURE_EXIT || 0));
`,
  );
  return app;
}

for (const mode of ['development', 'test', 'production', undefined]) {
  test(`build child uses production when parent NODE_ENV is ${mode}`, async (t) => {
    const app = await fixture(t);
    const env = { ...process.env, BUILD_ENV_FIXTURE: 'retained', VERIFY_CLIENT_BUNDLE: '0' };
    if (mode === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = mode;
    const result = spawnSync(process.execPath, [wrapper.pathname], {
      cwd: app,
      env,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(await readFile(join(app, 'child.json'), 'utf8')), {
      mode: 'production',
      verify: '1',
      inherited: 'retained',
      args: ['build'],
    });
    assert.equal(env.NODE_ENV, mode, 'the caller environment stays unchanged');
    assert.match(result.stdout, /Verified 1 client chunks/);
    assert.deepEqual(await readdir(join(app, '.next/static/chunks/nested')), ['app.js']);
  });
}

for (const [name, env, message] of [
  ['failed build', { FIXTURE_EXIT: '7' }, /Next app build failed \(7\)/],
  [
    'failed bundle verification',
    { FIXTURE_SOURCE: '/node_modules/postgres/index.js' },
    /Server modules in client chunk/,
  ],
]) {
  test(`cleans verification maps after ${name} and propagates failure`, async (t) => {
    const app = await fixture(t);
    const result = spawnSync(process.execPath, [wrapper.pathname], {
      cwd: app,
      env: { ...process.env, NODE_ENV: 'development', ...env },
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, message);
    assert.deepEqual(await readdir(join(app, '.next/static/chunks/nested')), ['app.js']);
  });
}
