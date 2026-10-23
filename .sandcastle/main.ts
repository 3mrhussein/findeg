import { run, claudeCode } from '@ai-hero/sandcastle';
import { docker } from '@ai-hero/sandcastle/sandboxes/docker';

// Simple loop: an agent that picks open issues one by one and closes them.
// Run this with: npx tsx .sandcastle/main.ts
// Or add to package.json scripts: "sandcastle": "npx tsx .sandcastle/main.ts"

await run({
  // A name for this run, shown as a prefix in log output.
  name: 'findeg-worker',

  // Sandbox provider — runs the agent inside an isolated container.
  sandbox: docker(),

  // The agent provider. Defaults to Claude 3.5 Sonnet / Sonnet 4.6, or can be overridden via SANDCASTLE_AGENT_MODEL.
  agent: claudeCode(process.env.SANDCASTLE_AGENT_MODEL || 'claude-sonnet-4-6'),

  // Path to the prompt file. Shell expressions inside are evaluated inside the
  // sandbox at the start of each iteration, so the agent always sees fresh data.
  promptFile: './.sandcastle/prompt.md',

  // Maximum number of iterations (agent invocations) to run in a session.
  // Each iteration works on a single issue. Increase this to process more issues
  // per run, or set it to 1 for a single-shot mode.
  maxIterations: 3,

  // Branch strategy:
  // - "merge-to-head": creates a temporary branch for the agent to work on, then merges back to HEAD.
  // - "branch": creates an isolated branch (e.g. for PR review before merging).
  branchStrategy: { type: 'merge-to-head' },

  // Copy node_modules from the host into the worktree before the sandbox
  // starts. This avoids a full pnpm install from scratch on every iteration.
  copyToWorktree: ['node_modules'],

  // Lifecycle hooks — commands grouped by where they run (host or sandbox).
  hooks: {
    sandbox: {
      // onSandboxReady runs once after the sandbox is initialised and the repo is
      // synced in, before the agent starts.
      onSandboxReady: [{ command: 'pnpm install --frozen-lockfile' }],
    },
  },
});
