import { spawnSync } from 'node:child_process';
import { readdir, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { verifyClientBundle } from './client-bundle.mjs';

// Run from either consuming Next app package, just like `next build`. The flag is scoped
// to this child process; normal next dev/build invocations do not emit maps.
const require = createRequire(resolve('package.json'));
const build = spawnSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build'], {
  stdio: 'inherit',
  env: { ...process.env, VERIFY_CLIENT_BUNDLE: '1' },
});

try {
  if (build.error) throw build.error;
  if (build.status !== 0)
    throw new Error(`Next app build failed (${build.signal ?? build.status})`);
  const frameworkPolyfill = await readFile(
    require.resolve('next/dist/build/polyfills/polyfill-nomodule'),
    'utf8',
  );
  const count = await verifyClientBundle('.next', { frameworkPolyfill });
  console.log(`Verified ${count} client chunks: no server dependencies.`);
} finally {
  // Next serves browser maps when present. Remove verification evidence before
  // deployment or E2E startup, even if the assertion fails.
  const chunks = '.next/static/chunks';
  const entries = await readdir(chunks, { recursive: true, withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.map'))
      .map((entry) => rm(join(entry.parentPath, entry.name))),
  );
}
