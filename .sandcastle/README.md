# Sandcastle in Findeg Monorepo

Sandcastle (`@ai-hero/sandcastle`) runs autonomous coding agents (Claude Code) fully AFK (Away From Keyboard) inside isolated Docker containers.

## Prerequisites

1. **Docker Desktop** installed and running.
2. **GitHub Token (`GH_TOKEN`)** with repository access (Issues: read/write, Contents: read/write).
3. **Claude Code Auth**:
   - Run `claude setup-token` on your host and paste the token into `CLAUDE_CODE_OAUTH_TOKEN` in `.sandcastle/.env`, OR
   - Set `ANTHROPIC_API_KEY`.

## Setup

1. Copy the environment configuration:
   ```bash
   cp .sandcastle/.env.example .sandcastle/.env
   ```
2. Populate `.sandcastle/.env` with your tokens.
3. Build the sandboxed Docker image (with Node 22, pnpm 11, gh CLI, and Claude Code):
   ```bash
   pnpm dlx @ai-hero/sandcastle docker build-image
   ```

## Running the AFK Factory

To process issues triaged with the `ready-for-agent` label:

```bash
pnpm sandcastle
```

Or directly via `tsx`:

```bash
npx tsx .sandcastle/main.ts
```

## How It Works

1. Queries GitHub for open issues labeled `ready-for-agent` (configured in `prompt.md`).
2. Provisions a dedicated Git worktree and mounts it into the container.
3. The agent implements the task using TDD, runs `pnpm type-check`, `pnpm test`, and `pnpm lint`.
4. Commits using Conventional Commits (`commitlint`-compliant).
5. Merges back cleanly or creates an isolated branch depending on your `branchStrategy`.
6. Closes the resolved GitHub issue.
