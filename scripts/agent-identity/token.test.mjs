// Run with: node --test scripts/agent-identity/token.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVerify, generateKeyPairSync } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appJwt, credentialResponse, identityLines } from './token.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ghWrapper = join(here, 'bin/gh');
const gitWrapper = join(here, 'bin/git');

test("appJwt is an RS256 JWT the app's public key verifies", () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const now = Date.UTC(2026, 9, 1);
  const jwt = appJwt('12345', privateKey.export({ type: 'pkcs1', format: 'pem' }), now);
  const [header, payload, signature] = jwt.split('.');

  assert.deepEqual(JSON.parse(Buffer.from(header, 'base64url')), { alg: 'RS256', typ: 'JWT' });
  const claims = JSON.parse(Buffer.from(payload, 'base64url'));
  assert.equal(claims.iss, '12345');
  assert.equal(claims.iat, now / 1000 - 60);
  assert.ok(claims.exp - claims.iat <= 600, 'GitHub rejects app JWTs valid for over 10 minutes');
  const verified = createVerify('RSA-SHA256')
    .update(`${header}.${payload}`)
    .verify(publicKey, Buffer.from(signature, 'base64url'));
  assert.ok(verified);
});

test('credentialResponse answers github.com only', () => {
  assert.equal(
    credentialResponse('protocol=https\nhost=github.com\n\n', 'tok'),
    'username=x-access-token\npassword=tok\n',
  );
  assert.equal(credentialResponse('protocol=https\nhost=gitlab.com\n\n', 'tok'), '');
});

test('identityLines makes the bot git author and committer', () => {
  const lines = identityLines({ login: "o'bot[bot]", email: '1+o@x' });
  assert.match(lines, /^export GIT_AUTHOR_NAME='o'\\''bot\[bot\]'$/m);
  assert.match(lines, /^export GIT_COMMITTER_EMAIL='1\+o@x'$/m);
});

/** A configured `tester` agent with a fresh cached token, so no network is needed. */
function testerEnv(extra = {}) {
  const configDir = mkdtempSync(join(tmpdir(), 'agent-config-'));
  const cacheDir = mkdtempSync(join(tmpdir(), 'agent-cache-'));
  writeFileSync(join(configDir, 'test.pem'), 'unused: the cached token is still fresh');
  writeFileSync(
    join(configDir, 'tester.json'),
    JSON.stringify({
      appId: 1,
      privateKeyPath: join(configDir, 'test.pem'),
      repository: 'o/r',
      login: 'tester[bot]',
      email: '9+tester[bot]@users.noreply.github.com',
    }),
  );
  writeFileSync(
    join(cacheDir, 'tester.json'),
    JSON.stringify({
      appId: '1',
      repository: 'o/r',
      login: 'tester[bot]',
      email: '9+tester[bot]@users.noreply.github.com',
      token: 'ghs_cached',
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    }),
  );
  const env = {
    ...process.env,
    FINDEG_AGENT_CONFIG_DIR: configDir,
    FINDEG_AGENT_CACHE_DIR: cacheDir,
    GIT_TERMINAL_PROMPT: '0',
    ...extra,
  };
  delete env.CLAUDECODE;
  return env;
}

const runGit = (args, env, input) =>
  execFileSync(gitWrapper, args, { cwd: here, encoding: 'utf8', env, input });

test('the git wrapper commits as the agent bot inside a findeg checkout', () => {
  const ident = runGit(['var', 'GIT_AUTHOR_IDENT'], testerEnv({ FINDEG_AGENT: 'tester' }));
  assert.match(ident, /^tester\[bot\] <9\+tester\[bot\]@users\.noreply\.github\.com>/);
});

test("the git wrapper hands git the agent token instead of the user's credential helpers", () => {
  const output = runGit(
    ['credential', 'fill'],
    testerEnv({ FINDEG_AGENT: 'tester' }),
    'protocol=https\nhost=github.com\n\n',
  );
  assert.match(output, /^username=x-access-token$/m);
  assert.match(output, /^password=ghs_cached$/m);
});

test('the git wrapper is plain git for humans and for FINDEG_AGENT=none', () => {
  const human = runGit(['var', 'GIT_AUTHOR_IDENT'], testerEnv());
  const optedOut = runGit(['var', 'GIT_AUTHOR_IDENT'], testerEnv({ FINDEG_AGENT: 'none' }));
  assert.doesNotMatch(human, /tester\[bot\]/);
  assert.doesNotMatch(optedOut, /tester\[bot\]/);
});

test('the git wrapper is plain git outside a findeg checkout', () => {
  const elsewhere = mkdtempSync(join(tmpdir(), 'not-findeg-'));
  execFileSync('git', ['init', '-q', elsewhere]);
  const ident = execFileSync(gitWrapper, ['var', 'GIT_AUTHOR_IDENT'], {
    cwd: elsewhere,
    encoding: 'utf8',
    env: testerEnv({ FINDEG_AGENT: 'tester' }),
  });
  assert.doesNotMatch(ident, /tester\[bot\]/);
});

test('the git wrapper fails closed when agent configuration is missing', () => {
  const env = testerEnv({ FINDEG_AGENT: 'missing' });
  assert.throws(() => runGit(['var', 'GIT_AUTHOR_IDENT'], env), /Command failed/);
});

test('the gh wrapper fails closed when agent configuration is missing', () => {
  const env = testerEnv({ FINDEG_AGENT: 'missing' });
  assert.throws(
    () => execFileSync(ghWrapper, ['--version'], { cwd: here, encoding: 'utf8', env }),
    /Command failed/,
  );
});

test('PR authors variable lists the agent bot first, then extras, without duplicates', async () => {
  const { authorsValue, authorsVariable, appNameFor } = await import('./agents-config.mjs');
  assert.equal(authorsVariable('claude'), 'CLAUDE_PR_AUTHORS');
  assert.equal(authorsValue('codex[bot]', ['other[bot]', 'codex[bot]']), 'codex[bot],other[bot]');
  assert.equal(appNameFor('claude', { appNamePrefix: '' }, {}), 'claude');
  assert.equal(appNameFor('claude', { appNamePrefix: 'x-' }, {}), 'x-claude');
  assert.equal(
    appNameFor('claude', { appNamePrefix: 'x-' }, { FINDEG_AGENT_APP_PREFIX: '' }),
    'claude',
  );
});
