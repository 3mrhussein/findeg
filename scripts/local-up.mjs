#!/usr/bin/env node
// One-shot local dev bring-up: generates .env.local if missing, starts Docker + Postgres,
// installs deps, compiles the runtime, migrates, then starts the web app.
// Safe to rerun on any machine: `pnpm local:up`. Run `pnpm local:up --help` for options.
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { randomBytes } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const exec = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envLocalPath = join(root, '.env.local');
const secret = () => randomBytes(32).toString('hex');

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------
const color = process.stdout.isTTY && process.env.NO_COLOR === undefined;
const c = (code, text) => (color ? `\x1b[${code}m${text}\x1b[0m` : String(text));
const bold = (t) => c('1', t);
const dim = (t) => c('2', t);
const red = (t) => c('31', t);
const green = (t) => c('32', t);
const yellow = (t) => c('33', t);
const blue = (t) => c('34', t);
const cyan = (t) => c('36', t);

let stepNumber = 0;
let totalSteps = 0;

function header(title) {
  console.log(`\n${bold(cyan(title))}`);
}
function step(message) {
  stepNumber += 1;
  console.log(`${dim(`[${stepNumber}/${totalSteps}]`)} ${blue('→')} ${message}`);
}
function ok(message) {
  console.log(`      ${green('✔')} ${message}`);
}
function info(message) {
  console.log(`      ${dim('ℹ')} ${dim(message)}`);
}
function warn(message) {
  console.log(`      ${yellow('⚠')} ${yellow(message)}`);
}
function fail(message) {
  console.error(`      ${red('✖')} ${red(message)}`);
}

class SetupError extends Error {
  constructor(message, hint) {
    super(message);
    this.hint = hint;
  }
}

// ---------------------------------------------------------------------------
// CLI options
// ---------------------------------------------------------------------------
function printHelp() {
  console.log(`
${bold('pnpm local:up')} — bring up the full FindEg dev stack on this machine.

${bold('What it does, in order:')}
  1. Generate ${cyan('.env.local')} with local dev credentials (skipped if it already exists)
  2. Mirror it into frontend/web/ and backend/
  3. Ensure Docker Desktop is running
  4. Start the local Postgres container
  5. Install dependencies
  6. Compile the runtime (backend, db, runtime packages)
  7. Run the ordered database migration history
  8. Start the web app on ${cyan('http://localhost:3000')}

${bold('Options:')}
  ${cyan('--reset')}          Wipe the local Postgres volume before starting (fresh database)
  ${cyan('--skip-install')}   Skip "pnpm install" (use if dependencies are already up to date)
  ${cyan('--no-dev')}         Do everything except starting the dev server (useful for CI checks)
  ${cyan('-h, --help')}       Show this help and exit

${bold('Examples:')}
  pnpm local:up                 # normal local run
  pnpm local:up --reset         # start from a clean database
  pnpm local:up --no-dev        # provision + migrate only, don't start Next.js

${bold('Env files:')} ${cyan('.env.local')} at the repo root is gitignored and mirrored into
${cyan('frontend/web/.env.local')} and ${cyan('backend/.env.local')}, which is where the web app and
backend actually read env vars from at runtime. Delete it and rerun this script to regenerate.
`);
}

function parseArgs(argv) {
  const options = { reset: false, skipInstall: false, dev: true };
  for (const arg of argv) {
    switch (arg) {
      case '--reset':
        options.reset = true;
        break;
      case '--skip-install':
        options.skipInstall = true;
        break;
      case '--no-dev':
        options.dev = false;
        break;
      case '-h':
      case '--help':
        options.help = true;
        break;
      default:
        throw new SetupError(
          `Unknown option: ${arg}`,
          'Run "pnpm local:up --help" to see the available options.',
        );
    }
  }
  return options;
}

// ---------------------------------------------------------------------------
// Process helpers
// ---------------------------------------------------------------------------
function run(command, args, { silent = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: silent ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      cwd: root,
    });
    let output = '';
    if (silent) {
      child.stdout?.on('data', (chunk) => (output += chunk));
      child.stderr?.on('data', (chunk) => (output += chunk));
    }
    child.on('error', (error) =>
      reject(new SetupError(`Could not run "${command}": ${error.message}`)),
    );
    child.on('exit', (code) => {
      if (code === 0) return resolve(output);
      const detail = silent && output.trim() ? `\n${dim(output.trim())}` : '';
      reject(
        new SetupError(`"${[command, ...args].join(' ')}" exited with code ${code}.${detail}`),
      );
    });
  });
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------
function ensureEnvLocal() {
  step('Checking for .env.local');
  if (existsSync(envLocalPath)) {
    ok('.env.local already exists — leaving it untouched');
    return;
  }
  const dbUser = 'findeg_user';
  const dbPassword = 'findeg_dev_password';
  const dbName = 'findeg';
  const dbPort = 5432;
  const contents = `# Generated by scripts/local-up.mjs for this machine. Gitignored; safe to edit or delete.

# App
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}
DATABASE_URL=postgresql://${dbUser}:${dbPassword}@localhost:${dbPort}/${dbName}

# JWT
JWT_SECRET=${secret()}
JWT_REFRESH_SECRET=${secret()}

# Public URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email
RESEND_API_KEY=
EMAIL_FROM=no-reply@findeg.com
EMAIL_FROM_NAME=Findeg
`;
  writeFileSync(envLocalPath, contents);
  ok('Generated .env.local with fresh local credentials and JWT secrets');
}

function mirrorEnvLocal() {
  step('Mirroring .env.local to frontend/web and backend');
  for (const target of [join(root, 'frontend/web/.env.local'), join(root, 'backend/.env.local')]) {
    copyFileSync(envLocalPath, target);
  }
  ok('Mirrored into frontend/web/.env.local and backend/.env.local');
}

function loadEnvLocal() {
  const lines = readFileSync(envLocalPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (match) process.env[match[1]] = match[2];
  }
}

async function postgresReady() {
  try {
    await exec(
      'docker',
      ['exec', 'findeg-dev-db', 'pg_isready', '-U', process.env.DB_USER, '-d', process.env.DB_NAME],
      { timeout: 5_000 },
    );
    return true;
  } catch {
    return false;
  }
}

async function waitForPostgres() {
  for (let attempt = 0; attempt < 15; attempt++) {
    if (await postgresReady()) return;
    await delay(2_000);
  }
  throw new SetupError(
    'Postgres did not become ready within 30s.',
    'Check "docker logs findeg-dev-db" for details, or try "pnpm local:up --reset".',
  );
}

async function ensureDocker() {
  step('Checking Docker Desktop');
  try {
    await run('node', [join(root, 'scripts/ensure-docker.mjs')]);
    ok('Docker is ready');
  } catch (error) {
    throw new SetupError(
      'Docker Desktop could not be started automatically.',
      'Install/start Docker Desktop manually, then rerun "pnpm local:up".',
    );
  }
}

async function resetDatabase(options) {
  if (!options.reset) return;
  step('Resetting the local Postgres volume (--reset)');
  warn('This deletes all local FindEg data in the "findeg-dev-db" volume.');
  await run('pnpm', ['db:reset']);
  ok('Volume removed');
}

async function startPostgres() {
  step('Starting Postgres container');
  try {
    await run('pnpm', ['db:run']);
  } catch (error) {
    throw new SetupError(
      'Failed to start the Postgres container.',
      'Confirm Docker Desktop is running and DB_PORT in .env.local is free.',
    );
  }
  await waitForPostgres();
  ok('Postgres is accepting connections');
}

async function installDependencies(options) {
  if (options.skipInstall) {
    step('Installing dependencies');
    info('Skipped (--skip-install)');
    return;
  }
  step('Installing dependencies (pnpm install --frozen-lockfile)');
  try {
    await run('pnpm', ['install', '--frozen-lockfile']);
    ok('Dependencies installed');
  } catch (error) {
    throw new SetupError(
      'Dependency install failed.',
      'Delete node_modules and pnpm-lock.yaml drift, or rerun without --frozen-lockfile manually.',
    );
  }
}

async function compileRuntime() {
  step('Compiling the runtime (backend, db, runtime packages)');
  try {
    await run('pnpm', ['runtime:compile']);
    ok('Runtime compiled');
  } catch (error) {
    throw new SetupError(
      'Runtime compilation failed (a package failed to build or type-check).',
      'Scroll up for the turbo/tsc output above — fix the reported file, then rerun.',
    );
  }
}

async function runMigrations() {
  step('Running database migrations');
  try {
    await run('pnpm', ['migrate']);
    ok('Migrations applied');
  } catch (error) {
    throw new SetupError(
      'Migration run failed.',
      'If the database is in an inconsistent state (e.g. "already exists" errors), try "pnpm local:up --reset".',
    );
  }
}

async function startDev(options) {
  step('Starting the web app');
  if (!options.dev) {
    info('Skipped (--no-dev). Stack is provisioned and migrated but not running.');
    return;
  }
  console.log(
    `\n${green('✔ Stack is ready.')} Starting Next.js on ${bold(cyan('http://localhost:3000'))} ${dim('(Ctrl+C to stop)')}\n`,
  );
  await run('pnpm', ['dev']);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  totalSteps = 8 + (options.reset ? 1 : 0);

  header('FindEg — local dev bring-up');

  ensureEnvLocal();
  mirrorEnvLocal();
  loadEnvLocal();
  process.env.RELEASE_REVISION ??= (await exec('git', ['rev-parse', 'HEAD'])).stdout.trim();

  await ensureDocker();
  await resetDatabase(options);
  await startPostgres();
  await installDependencies(options);
  await compileRuntime();
  await runMigrations();
  await startDev(options);
}

main().catch((error) => {
  console.log('');
  if (error instanceof SetupError) {
    fail(error.message);
    if (error.hint) console.log(`      ${dim('→')} ${yellow(error.hint)}`);
  } else {
    fail(error.stack ?? String(error));
  }
  console.log('');
  process.exitCode = 1;
});
