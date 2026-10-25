// Real PostgreSQL control only. Starts a fresh, loopback-only disposable cluster.
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
if (process.env.NODE_ENV !== 'development') process.exit(2);
const require = createRequire(import.meta.url);
const binary = join(dirname(require.resolve('@embedded-postgres/darwin-x64')), '..', 'native');
// Installation deliberately disables lifecycle scripts. Run only this inspected,
// pinned package's normal postinstall to restore its packaged relative symlinks.
const hydrated = spawnSync(
  process.execPath,
  [join(binary, '..', 'scripts', 'hydrate-symlinks.js')],
  { cwd: join(binary, '..'), timeout: 5000 },
);
if (hydrated.status !== 0) throw new Error('PostgreSQL library symlink hydration failed');
const root = await mkdtemp(join(tmpdir(), 'wf-pg-control-'));
const data = join(root, 'PROTOTYPE-wipe-me');
const server = createServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
await new Promise((resolve) => server.close(resolve));
const execute = (command, args) => {
  const result = spawnSync(join(binary, 'bin', command), args, {
    encoding: 'utf8',
    timeout: 30_000,
  });
  if (result.status !== 0)
    throw new Error(
      `${command} failed: ${result.error?.message ?? result.stderr ?? result.stdout}`,
    );
};
let started = false;
try {
  execute('initdb', [
    '-D',
    data,
    '-U',
    'postgres',
    '-A',
    'trust',
    '--encoding=UTF8',
    '--no-locale',
  ]);
  execute('pg_ctl', [
    '-D',
    data,
    '-l',
    join(root, 'server.log'),
    '-o',
    `-h 127.0.0.1 -p ${port} -k /tmp`,
    '-w',
    '-t',
    '20',
    'start',
  ]);
  started = true;
  const child = spawn(
    process.execPath,
    [new URL('run.mjs', import.meta.url).pathname, 'postgres'],
    {
      env: {
        ...process.env,
        PROTOTYPE_POSTGRES_URL: `postgresql://postgres@127.0.0.1:${port}/postgres`,
      },
      stdio: 'inherit',
    },
  );
  process.exitCode = await new Promise((resolve) => child.on('exit', (code) => resolve(code ?? 1)));
} finally {
  if (started) execute('pg_ctl', ['-D', data, '-m', 'fast', '-w', '-t', '20', 'stop']);
  await rm(root, { recursive: true, force: true });
}
