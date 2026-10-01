// Run with: node --test scripts/agent-identity/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVerify, generateKeyPairSync } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appJwt, credentialResponse, envLines } from './token.mjs';

const here = dirname(fileURLToPath(import.meta.url));

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

test('envLines sets the bot as git author/committer and puts the shims first on PATH', () => {
  const lines = envLines(
    'claude',
    { login: 'findeg-claude[bot]', email: '1+findeg-claude[bot]@users.noreply.github.com' },
    '/x/bin',
  );
  assert.match(lines, /^export FINDEG_AGENT='claude'$/m);
  assert.match(lines, /^export GIT_AUTHOR_NAME='findeg-claude\[bot\]'$/m);
  assert.match(
    lines,
    /^export GIT_COMMITTER_EMAIL='1\+findeg-claude\[bot\]@users\.noreply\.github\.com'$/m,
  );
  assert.match(lines, /^export PATH='\/x\/bin':"\$PATH"$/m);
});

test("the git shim hands git the agent token instead of the user's credential helpers", () => {
  const configDir = mkdtempSync(join(tmpdir(), 'agent-config-'));
  const cacheDir = mkdtempSync(join(tmpdir(), 'agent-cache-'));
  writeFileSync(join(configDir, 'test.pem'), 'unused: the cached token is still fresh');
  writeFileSync(
    join(configDir, 'tester.json'),
    JSON.stringify({ appId: 1, privateKeyPath: join(configDir, 'test.pem'), repository: 'o/r' }),
  );
  writeFileSync(
    join(cacheDir, 'tester.json'),
    JSON.stringify({
      appId: '1',
      repository: 'o/r',
      login: 't[bot]',
      email: 't@x',
      token: 'ghs_cached',
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    }),
  );

  const output = execFileSync(join(here, 'bin/git'), ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n',
    encoding: 'utf8',
    env: {
      ...process.env,
      FINDEG_AGENT: 'tester',
      FINDEG_AGENT_CONFIG_DIR: configDir,
      FINDEG_AGENT_CACHE_DIR: cacheDir,
      GIT_TERMINAL_PROMPT: '0',
    },
  });
  assert.match(output, /^username=x-access-token$/m);
  assert.match(output, /^password=ghs_cached$/m);
});
