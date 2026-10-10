# IMPORTANT

Before any other action in the codebase, check `git branch --show-current`. Unless it is `develop` or `main`, the branch must be `<type>/<kebab-case-slug>` with type one of `feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert`; if it is not, rename it now with `git branch -m <type>/<slug>`.

## Agent skills

### Issue tracker

GitHub Issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (root `GLOSSARY.md` + `docs/adr/`) when those files exist. See `docs/agents/domain.md`.

### Next.js version

`frontend/dashboard` and `frontend/storefront` pin a Next.js version newer than training data, with breaking API/convention changes. pnpm installs `next` only inside each app, so `node_modules/next` does not exist at the repo root. Before writing Next.js-specific code, read `frontend/dashboard/node_modules/next/AGENTS.md` and the bundled docs it points to (`frontend/dashboard/node_modules/next/dist/docs/`; the storefront has identical copies) rather than relying on memory.

**The server/client boundary is Next.js's job.** Never fix a client-bundle leak in `backend`, `db` or `packages/*` (no `server-only` there, no entry splitting for bundlers). Put `import 'server-only'` as the first import of a server-side app module (the `src/data/**/queries.ts` layer); a Client Component that reaches it fails the build. See `server-and-client-boundary.md` and `data-security.md` under `dist/docs/01-app/02-guides/`, and "Preventing environment poisoning" in `dist/docs/01-app/01-getting-started/05-server-and-client-components.md`.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
