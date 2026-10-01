#!/usr/bin/env node
// Mints short-lived GitHub App installation tokens so each coding agent
// (Claude Code, Codex) acts on GitHub as its own bot identity instead of as
// the human whose machine it runs on. See docs/agents/agent-identity.md.
//
// Usage: token.mjs <agent> [command]
//   token                 print an installation token (default)
//   identity              print `export` lines making the bot git author/committer
//   whoami                print the agent's bot login and git identity
//   git-credential <op>   git credential-helper protocol (used by bin/git)
//
// Per-machine config, never committed, written by setup-app.mjs:
//   ~/.config/findeg/agents/<agent>.json
//   { "appId": 123456, "privateKeyPath": "~/.config/findeg/agents/<agent>.pem",
//     "repository": "owner/name", "login": "<slug>[bot]",
//     "email": "<id>+<slug>[bot]@users.noreply.github.com" }
//   "repository" defaults to the `origin` remote; "login"/"email" are looked up when missing.
import { createSign } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir, userInfo } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.github.com';
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

const expandHome = (path) => path.replace(/^~(?=\/|$)/, homedir());
export const configDir = () =>
  process.env.FINDEG_AGENT_CONFIG_DIR ??
  join(process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'), 'findeg/agents');
// Sandboxes (e.g. Codex workspace-write) may not allow writing ~/.cache, so the
// temp directory is a fallback; if neither is writable, every call mints anew.
const cacheDirs = () =>
  process.env.FINDEG_AGENT_CACHE_DIR
    ? [process.env.FINDEG_AGENT_CACHE_DIR]
    : [
        join(process.env.XDG_CACHE_HOME ?? join(homedir(), '.cache'), 'findeg/agents'),
        join(tmpdir(), `findeg-agents-${userInfo().uid}`),
      ];

function fail(message) {
  console.error(`agent-identity: ${message}`);
  process.exit(1);
}

export function loadConfig(agent) {
  const path = join(configDir(), `${agent}.json`);
  if (!existsSync(path)) return null;
  const config = JSON.parse(readFileSync(path, 'utf8'));
  if (!config.appId || !config.privateKeyPath) {
    fail(`${path} needs "appId" and "privateKeyPath"`);
  }
  return {
    appId: String(config.appId),
    privateKey: readFileSync(expandHome(config.privateKeyPath), 'utf8'),
    repository: config.repository ?? originRepository(),
    login: config.login,
    email: config.email,
  };
}

function requireConfig(agent) {
  const config = loadConfig(agent);
  if (!config) fail(`${agent} isn't set up: no ${join(configDir(), `${agent}.json`)}`);
  return config;
}

function originRepository() {
  // Disable agent routing in case `git` resolves to our wrapper. This avoids
  // recursion for hand-written configs that intentionally omit `repository`.
  const url = execFileSync('git', ['remote', 'get-url', 'origin'], {
    encoding: 'utf8',
    env: { ...process.env, FINDEG_AGENT: 'none' },
  }).trim();
  const match = url.match(/github\.com[:/](.+?\/.+?)(?:\.git)?$/);
  if (!match) fail(`can't read owner/name from origin remote "${url}"; set "repository"`);
  return match[1];
}

const base64url = (value) => Buffer.from(value).toString('base64url');

/** App JWT (RS256), valid for 9 minutes, backdated 60s for clock drift. */
export function appJwt(appId, privateKey, now = Date.now()) {
  const iat = Math.floor(now / 1000) - 60;
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ iat, exp: iat + 600, iss: appId }));
  const signature = createSign('RSA-SHA256').update(`${header}.${payload}`).sign(privateKey);
  return `${header}.${payload}.${base64url(signature)}`;
}

async function github(path, { token, scheme = 'Bearer', method = 'GET', body } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token && { Authorization: `${scheme} ${token}` }),
      ...(body && { 'Content-Type': 'application/json' }),
    },
    body: body && JSON.stringify(body),
  });
  if (!response.ok) fail(`GitHub ${method} ${path} → ${response.status} ${await response.text()}`);
  return response.json();
}

/** Token + identity, cached until 5 minutes before the token expires. */
export async function session(agent) {
  const config = requireConfig(agent);

  for (const dir of cacheDirs()) {
    const cachePath = join(dir, `${agent}.json`);
    if (!existsSync(cachePath)) continue;
    const cached = JSON.parse(readFileSync(cachePath, 'utf8'));
    const fresh = Date.parse(cached.expiresAt) - Date.now() > REFRESH_MARGIN_MS;
    if (fresh && cached.appId === config.appId && cached.repository === config.repository) {
      return cached;
    }
  }

  const jwt = appJwt(config.appId, config.privateKey);
  const app = await github('/app', { token: jwt });
  const installation = await github(`/repos/${config.repository}/installation`, { token: jwt });
  const repoName = config.repository.split('/')[1];
  const { token, expires_at: expiresAt } = await github(
    `/app/installations/${installation.id}/access_tokens`,
    { token: jwt, method: 'POST', body: { repositories: [repoName] } },
  );
  const login = `${app.slug}[bot]`;
  const { id: botId } = await github(`/users/${encodeURIComponent(login)}`, {
    token,
    scheme: 'token',
  });

  const result = {
    appId: config.appId,
    repository: config.repository,
    login,
    email: `${botId}+${login}@users.noreply.github.com`,
    token,
    expiresAt,
  };
  for (const dir of cacheDirs()) {
    try {
      mkdirSync(dir, { recursive: true, mode: 0o700 });
      const cachePath = join(dir, `${agent}.json`);
      writeFileSync(cachePath, JSON.stringify(result), { mode: 0o600 });
      chmodSync(cachePath, 0o600);
      break;
    } catch {
      // Not writable here; try the next directory.
    }
  }
  return result;
}

const shellQuote = (value) => `'${String(value).replaceAll("'", `'\\''`)}'`;

export function identityLines({ login, email }) {
  return [
    `export GIT_AUTHOR_NAME=${shellQuote(login)}`,
    `export GIT_AUTHOR_EMAIL=${shellQuote(email)}`,
    `export GIT_COMMITTER_NAME=${shellQuote(login)}`,
    `export GIT_COMMITTER_EMAIL=${shellQuote(email)}`,
  ].join('\n');
}

/** git credential-helper `get`: answer only for github.com. */
export function credentialResponse(request, token) {
  const fields = Object.fromEntries(
    request
      .split('\n')
      .filter((line) => line.includes('='))
      .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]),
  );
  if (fields.host !== 'github.com') return '';
  return `username=x-access-token\npassword=${token}\n`;
}

async function main([agent, command = 'token', ...rest]) {
  if (!agent || !/^[a-z0-9-]+$/.test(agent))
    fail('usage: token.mjs <agent> [token|identity|whoami|git-credential <op>]');

  switch (command) {
    case 'token':
      console.log((await session(agent)).token);
      return;
    case 'identity': {
      // setup-app.mjs stores login/email, so this normally needs no network.
      const config = requireConfig(agent);
      console.log(identityLines(config.login && config.email ? config : await session(agent)));
      return;
    }
    case 'whoami': {
      const { login, email, repository, expiresAt } = await session(agent);
      console.log(`${login} <${email}> on ${repository} (token valid until ${expiresAt})`);
      return;
    }
    case 'git-credential': {
      if (rest[0] !== 'get') return; // nothing to store or erase: tokens are minted on demand
      process.stdout.write(
        credentialResponse(readFileSync(0, 'utf8'), (await session(agent)).token),
      );
      return;
    }
    default:
      fail(`unknown command "${command}"`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main(process.argv.slice(2));
}
