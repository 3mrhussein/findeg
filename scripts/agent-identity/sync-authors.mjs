#!/usr/bin/env node
// Sets each agent's `<AGENT>_PR_AUTHORS` repo variable (read by .github/workflows/claude.yml) from
// the bot login GitHub reports for its app, plus `extraBots` from agents.json. Re-run it after
// renaming an app. Runs `gh` as you (FINDEG_AGENT=none), since the agent bots can't write variables.
//
// Usage: node scripts/agent-identity/sync-authors.mjs [--dry-run] [agent ...]
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { configDir, session } from './token.mjs';
import { authorsValue, authorsVariable, loadAgentsConfig } from './agents-config.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const requested = args.filter((arg) => !arg.startsWith('--'));
const { agents } = loadAgentsConfig();

for (const agent of requested.length ? requested : Object.keys(agents)) {
  const configPath = join(configDir(), `${agent}.json`);
  if (!existsSync(configPath)) {
    console.log(`${agent}: not set up on this machine, skipped`);
    continue;
  }
  // Fresh lookup, so a renamed app is picked up; keep the stored git identity in step.
  const { login, email, repository } = await session(agent);
  const stored = JSON.parse(readFileSync(configPath, 'utf8'));
  if (stored.login !== login || stored.email !== email) {
    writeFileSync(configPath, JSON.stringify({ ...stored, login, email }, null, 2) + '\n', {
      mode: 0o600,
    });
  }

  const name = authorsVariable(agent);
  const value = authorsValue(login, agents[agent]?.extraBots);
  console.log(`${name}=${value}`);
  if (!dryRun) {
    execFileSync('gh', ['variable', 'set', name, '--repo', repository, '--body', value], {
      stdio: 'inherit',
      env: { ...process.env, FINDEG_AGENT: 'none' },
    });
  }
}
