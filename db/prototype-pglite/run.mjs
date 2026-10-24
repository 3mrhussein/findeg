// PROTOTYPE: disposable compatibility evidence; never production composition.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('.', import.meta.url));
const root = fileURLToPath(new URL('../../', import.meta.url));
const dbRequire = createRequire(new URL('../package.json', import.meta.url));
try {
  dbRequire.resolve('tsx/cli');
} catch {
  const installed = spawnSync(
    'pnpm',
    ['--filter', '@findeg/db...', 'install', '--frozen-lockfile', '--ignore-scripts'],
    {
      cwd: root,
      stdio: 'inherit',
    },
  );
  if (installed.status !== 0) process.exit(installed.status ?? 1);
}
const installed = spawnSync(
  'pnpm',
  [
    'install',
    '--ignore-workspace',
    '--ignore-scripts',
    existsSync(new URL('pnpm-lock.yaml', import.meta.url))
      ? '--frozen-lockfile'
      : '--no-frozen-lockfile',
  ],
  { cwd: directory, stdio: 'inherit' },
);
if (installed.status !== 0) process.exit(installed.status ?? 1);
const mode = { apps: 'serve.mjs', protocol: 'protocol-repro.mjs' }[process.argv[2]] ?? 'gate.mjs';
const result = spawnSync(
  process.execPath,
  [fileURLToPath(new URL(mode, import.meta.url)), ...process.argv.slice(3)],
  {
    cwd: root,
    stdio: 'inherit',
    timeout: mode === 'serve.mjs' ? undefined : 240_000,
  },
);
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
