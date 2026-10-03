#!/usr/bin/env node
// Creates and installs an agent's GitHub App via GitHub's app-manifest flow,
// then writes the per-machine config token.mjs reads. Two clicks in the
// browser: "Create GitHub App", then "Install".
//
// Usage: node scripts/agent-identity/setup-app.mjs <agent> [--name <app name>] [--repo owner/name]
// The default app name is `appNamePrefix` (agents.json) + the agent name.
// See docs/agents/agent-identity.md.
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { appJwt, configDir as agentConfigDir, session } from './token.mjs';
import { appNameFor, authorsVariable } from './agents-config.mjs';

const [agent, ...args] = process.argv.slice(2);
if (!agent || !/^[a-z0-9-]+$/.test(agent)) {
  console.error('usage: setup-app.mjs <agent> [--name <app name>] [--repo owner/name]');
  process.exit(2);
}
const option = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1];
};
const repository = option('--repo', 'origin');
const appName = option('--name', appNameFor(agent));

const configDir = agentConfigDir();
const configPath = join(configDir, `${agent}.json`);
if (existsSync(configPath)) {
  console.error(`${configPath} already exists; delete it to set ${agent} up again.`);
  process.exit(1);
}

const gh = (...ghArgs) => execFileSync('gh', ghArgs, { encoding: 'utf8' }).trim();
const repo = JSON.parse(
  gh(
    'repo',
    'view',
    ...(repository === 'origin' ? [] : [repository]),
    '--json',
    'nameWithOwner,id,owner',
  ),
);
const repoId = gh('api', `/repos/${repo.nameWithOwner}`, '--jq', '.id');
const ownerId = gh('api', `/users/${repo.owner.login}`, '--jq', '.id');

const state = randomBytes(16).toString('hex');
let app;

const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const reply = (html) => {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(
      `<!doctype html><meta charset="utf-8"><body style="font:16px system-ui;margin:3em">${html}`,
    );
  };

  if (url.pathname === '/') {
    const base = `http://127.0.0.1:${server.address().port}`;
    const manifest = {
      name: appName,
      url: `https://github.com/${repo.nameWithOwner}`,
      description: `${agent} coding agent identity for ${repo.nameWithOwner}`,
      redirect_url: `${base}/created`,
      setup_url: `${base}/installed`,
      public: false,
      default_permissions: {
        contents: 'write',
        pull_requests: 'write',
        issues: 'write',
        workflows: 'write',
        metadata: 'read',
      },
      default_events: [],
    };
    const escaped = JSON.stringify(manifest).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
    return reply(
      `<p>Creating the <b>${appName}</b> GitHub App…</p>
       <form id="f" method="post" action="https://github.com/settings/apps/new?state=${state}">
         <input type="hidden" name="manifest" value="${escaped}"><button>Continue to GitHub</button>
       </form><script>document.getElementById('f').submit()</script>`,
    );
  }

  if (url.pathname === '/created') {
    if (url.searchParams.get('state') !== state) return reply('State mismatch; start again.');
    const conversion = await fetch(
      `https://api.github.com/app-manifests/${url.searchParams.get('code')}/conversions`,
      { method: 'POST', headers: { Accept: 'application/vnd.github+json' } },
    );
    if (!conversion.ok) return reply(`GitHub refused the manifest code: ${conversion.status}`);
    app = await conversion.json();

    mkdirSync(configDir, { recursive: true, mode: 0o700 });
    const keyPath = join(configDir, `${agent}.pem`);
    writeFileSync(keyPath, app.pem, { mode: 0o600 });
    writeFileSync(
      configPath,
      JSON.stringify(
        { appId: app.id, privateKeyPath: keyPath, repository: repo.nameWithOwner },
        null,
        2,
      ) + '\n',
      { mode: 0o600 },
    );
    console.log(`Created ${app.slug} (app id ${app.id}); key and config in ${configDir}`);

    response.writeHead(302, {
      Location:
        `https://github.com/apps/${app.slug}/installations/new/permissions` +
        `?suggested_target_id=${ownerId}&repository_ids[]=${repoId}`,
    });
    return response.end();
  }

  if (url.pathname === '/installed') {
    reply(`<p><b>${app?.slug ?? appName}</b> is installed. You can close this tab.</p>`);
    await confirmInstallation();
    return;
  }

  response.writeHead(404).end();
});

async function confirmInstallation() {
  const jwt = appJwt(String(app.id), app.pem);
  const installation = await fetch(
    `https://api.github.com/repos/${repo.nameWithOwner}/installation`,
    {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${jwt}` },
    },
  );
  if (!installation.ok) {
    console.error(`${app.slug} isn't installed on ${repo.nameWithOwner} (${installation.status}).`);
    console.error(
      `Install it at https://github.com/apps/${app.slug}/installations/new and re-run whoami.`,
    );
    process.exit(1);
  }
  // Store the bot's git identity so git can commit as it without network access.
  const { login, email } = await session(agent);
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  writeFileSync(configPath, JSON.stringify({ ...config, login, email }, null, 2) + '\n', {
    mode: 0o600,
  });
  console.log(`Installed ${login} <${email}> on ${repo.nameWithOwner}.`);
  console.log(
    `Run: node scripts/agent-identity/sync-authors.mjs ${agent}   # sets ${authorsVariable(agent)}`,
  );
  server.close();
}

server.listen(0, '127.0.0.1', () => {
  const start = `http://127.0.0.1:${server.address().port}/`;
  console.log(`Opening ${start} — click "Create GitHub App", then "Install".`);
  try {
    execFileSync('open', [start]);
  } catch {
    console.log(`Open ${start} in your browser.`);
  }
});
