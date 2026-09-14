import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join, delimiter } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const exec = promisify(execFile);
const app = '/Applications/Docker.app';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code}`));
    });
  });
}

async function ready() {
  try {
    await exec('docker', ['info'], { timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}

/** Prepare local Docker; callers supplying their own test database skip this. */
export async function ensureDocker() {
  if (await ready()) return;
  if (process.env.CI) {
    throw new Error(
      'Docker is unavailable in CI. Provision Docker or set MIGRATION_TEST_DATABASE_URL.',
    );
  }
  if (process.platform !== 'darwin') {
    throw new Error(
      'Start Docker or install it for your OS: https://docs.docker.com/get-started/get-docker/',
    );
  }
  if (!['arm64', 'x64'].includes(process.arch)) {
    throw new Error(`Unsupported macOS architecture: ${process.arch}`);
  }

  if (!(await exists(app))) {
    const directory = await mkdtemp(join(tmpdir(), 'findeg-docker-'));
    const volume = join(directory, 'volume');
    let mounted = false;
    try {
      const arch = process.arch === 'arm64' ? 'arm64' : 'amd64';
      console.log('Installing Docker Desktop from Docker’s official macOS download…');
      await run('curl', [
        '--fail',
        '--location',
        '--retry',
        '2',
        '--output',
        join(directory, 'Docker.dmg'),
        `https://desktop.docker.com/mac/main/${arch}/Docker.dmg`,
      ]);
      await run('hdiutil', [
        'attach',
        '-nobrowse',
        '-readonly',
        join(directory, 'Docker.dmg'),
        '-mountpoint',
        volume,
      ]);
      mounted = true;
      await run('codesign', ['--verify', '--deep', '--strict', join(volume, 'Docker.app')]);
      await run('ditto', [join(volume, 'Docker.app'), app]);
    } finally {
      if (mounted) await run('hdiutil', ['detach', volume]);
      await rm(directory, { recursive: true, force: true });
    }
  }

  // Make the bundled CLI available to this process and its test subprocesses.
  process.env.PATH = [
    join(app, 'Contents/Resources/bin'),
    join(homedir(), '.docker/bin'),
    process.env.PATH ?? '',
  ].join(delimiter);
  if (await ready()) return;
  console.log('Starting Docker Desktop. Complete any first-run setup in its window.');
  await run('open', ['-a', app]);
  for (let attempt = 0; attempt < 60; attempt++) {
    if (await ready()) return;
    if (attempt % 6 === 0) console.log('Waiting for Docker Desktop to become ready…');
    await delay(5_000);
  }
  throw new Error(
    'Docker Desktop is not ready. Complete its setup, then rerun pnpm docker:ensure.',
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await ensureDocker();
  console.log('Docker is ready.');
}
