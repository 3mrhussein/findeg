// Isolated harness-only packaging check; does not validate either app's artifact.
import { mkdtemp, cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
if (process.env.NODE_ENV !== 'development') process.exit(2);
const here = new URL('./', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('package.json', here), 'utf8'));
if (Object.keys(manifest.dependencies ?? {}).length)
  throw new Error('Setup dependencies must be development-only');
const temporary = await mkdtemp(join(tmpdir(), 'wf-production-packaging-'));
const checks = [];
try {
  for (const file of [
    'package.json',
    'pnpm-lock.yaml',
    'prepare.mjs',
    'worker.mjs',
    'run.mjs',
    'control.mjs',
    'packaging.mjs',
  ]) {
    await cp(new URL(file, here), join(temporary, file));
  }
  await mkdir(join(temporary, 'upstream/pg-protocol'), { recursive: true });
  await cp(
    new URL('upstream/pg-protocol/package.json', here),
    join(temporary, 'upstream/pg-protocol/package.json'),
  );
  const install = spawnSync(
    'pnpm',
    ['install', '--ignore-workspace', '--ignore-scripts', '--prod', '--frozen-lockfile'],
    {
      cwd: temporary,
      encoding: 'utf8',
      timeout: 60_000,
    },
  );
  if (install.status !== 0) throw new Error(install.stdout + install.stderr);
  const require = createRequire(join(temporary, 'package.json'));
  for (const name of Object.keys(manifest.devDependencies)) {
    let absent = false;
    try {
      require.resolve(name);
    } catch (error) {
      absent = error.code === 'MODULE_NOT_FOUND';
    }
    checks.push({ name, absent });
    if (!absent) throw new Error(`Production-only install resolves ${name}`);
  }
  for (const runtime of ['production', 'test', null]) {
    for (const script of ['prepare.mjs', 'worker.mjs', 'run.mjs', 'control.mjs', 'packaging.mjs']) {
      const env = { ...process.env };
      if (runtime === null) delete env.NODE_ENV;
      else env.NODE_ENV = runtime;
      const result = spawnSync(process.execPath, [script], {
        cwd: temporary,
        env,
        encoding: 'utf8',
        timeout: 5000,
      });
      checks.push({ runtime, script, exitCode: result.status });
      if (result.status !== 2 || /MODULE_NOT_FOUND/.test(result.stderr))
        throw new Error('Runtime guard did not reject before package loading');
    }
  }
  await writeFile(
    new URL('evidence/packaging.json', here),
    JSON.stringify({ scope: 'isolated harness only', checks }, null, 2) + '\n',
  );
  console.log(
    'Production-only installation omits every setup package; all entrypoints reject production/test/unset runtime.',
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
