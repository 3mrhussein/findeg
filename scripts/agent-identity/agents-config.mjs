// Committed, non-secret agent settings (agents.json), shared by setup-app.mjs and sync-authors.mjs.
//   appNamePrefix  prepended to the agent name for new GitHub Apps (override: FINDEG_AGENT_APP_PREFIX)
//   agents.<name>.extraBots  other bot logins allowed to open PRs for that agent (e.g. a GitHub app
//                            that isn't one of our own identities)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const file = join(dirname(fileURLToPath(import.meta.url)), 'agents.json');

export const loadAgentsConfig = () => JSON.parse(readFileSync(file, 'utf8'));

export const appNameFor = (agent, config = loadAgentsConfig(), env = process.env) =>
  `${env.FINDEG_AGENT_APP_PREFIX ?? config.appNamePrefix ?? ''}${agent}`;

/** Name of the repo variable listing an agent's PR-author bot logins, e.g. CLAUDE_PR_AUTHORS. */
export const authorsVariable = (agent) => `${agent.toUpperCase().replaceAll('-', '_')}_PR_AUTHORS`;

/** Comma-separated bot logins for the variable: the agent's own bot first, then any extras. */
export const authorsValue = (login, extraBots = []) =>
  [...new Set([login, ...extraBots])].join(',');
