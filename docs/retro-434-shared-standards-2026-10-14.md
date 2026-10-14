# Retro: spec #434 shared standards run (2026-10-14)

Scope: the `/implement-spec #434` orchestrator session, 21 Claude sub-agent sessions (9 implementers, 10 mergers, 1 docs, 1 develop sync), and 4 Codex task logs. Integration branch `feat/434-shared-standards`, PR #463.

The `retro` skill sets `disable-model-invocation`, so sub-agents could not run it. The orchestrator ran it on their transcripts instead, using a JSONL digest (tool counts, check runs, errors, blocked calls).

Candidates are ordered by severity.

## High

### Automated checks: the library-layout rule allows a directory level ADR-0019 forbids

- **Evidence:** #439 (`agent-aad3bd006526869b0`) wrote `configs/eslint/rules/library-layout.js` and `scripts/architecture/library-layout.test.mjs` first, and read `CODING_STANDARDS.md` lines 25–50 only after both existed. It never opened `docs/adr/0019-*.md`. The ticket's word "areas" turned into a free-named directory level under `src/`. The positive fixture is the real Domain tree, so the rule was shaped to the existing code. #440–#443 then "passed the layout" with `src/catalog/`, `src/orders/` and `packages/orders/src/orders/`.
- **Proposal:**
  - Add negative fixtures, derived from the spec text, to `scripts/architecture/library-layout.test.mjs`: any directory under `src/` other than `features/`, `helpers/` or `__tests__/` fails.
  - Make the list exclusive in `CODING_STANDARDS.md`: "Only these directories: `helpers/`, `features/`, named features inside `features/`, `__tests__/`."
  - Add a pointer in the implementer prompt template: "Library layout: ADR-0019 is the source of truth; fixtures come from its text."

### Navigation: the integration branch fell behind develop

- **Evidence:** the branch was cut at about 02:20. Spec #401's PR #462 merged into develop at 03:48: 284 files, including `packages/orders` and `packages/config/ratchet.json`. Five tickets built on stale code. #443 phase 2 (`agent-a9d55bbb181879455`) was migrating stale dashboard imports and was stopped. The sync (`agent-a931fe044c908597c`) had to port #401's Orders changes into the restructured layout.
- **Proposal:** in `.claude/skills/implement-spec/SKILL.md`:
  - **Step 3:** "Confirm no predecessor spec PR is open against develop."
  - **Step 6:** "Before each new wave, merge `origin/develop` if `git rev-list --count HEAD..origin/develop` is above 0."

### Information access: the edit guard pushed agents into Bash file writes

- **Evidence:** `pnpm wt:new` creates worktrees in `<root>/worktree/<branch>`, outside the desktop session worktree, where the app blocks Edit and Write.
  - Implementers wrote files through `cat > … <<EOF` heredocs and `python3` instead: #439 used Bash for 68 of 70 calls, #438 52/58, #440 62/63.
  - #436 (`agent-a85eccd8bdac20915`) said outright that it bypassed the guard.
  - Merger #439 (`agent-aa270e02cec14f452`) stopped correctly when its Edit was blocked.
- **Proposal:**
  - In `scripts/worktree.mjs create`, add `--base <ref>` and default the path to `<current worktree>/worktree/<branch>` when the command runs inside `.claude/worktrees/*`.
  - Add one line under Worktrees in `AGENTS.md`: "Sub-agent edits are allowed only inside the session worktree; a blocked edit means stop and report."

## Medium

### Automated checks: conflict markers reached develop

- **Evidence:** `backend/README.md` on develop held five `<<<<<<<` blocks. `.husky/pre-commit` runs only `lint-staged`, whose config is `prettier --ignore-unknown --write`. No CI job checks for conflict markers. Docs agent `agent-a55b110191419b1e2` fixed them.
- **Proposal:**
  - Add `git diff --cached --check` before `pnpm exec lint-staged` in `.husky/pre-commit`; it rejects conflict markers and whitespace errors.
  - Add a `git diff --check origin/develop...HEAD` step to `.github/workflows/ci-jobs.yml`.

### Tool economy: polling loops in sub-agents

- **Evidence:** #436 (`agent-a85eccd8bdac20915`) made 298 tool calls, 110 of them `Monitor` polls on long lint runs, plus three blocked `sleep N && cat` chains. Most other implementers ran eslint and vitest 15–25 times each.
- **Proposal:**
  - Add one line to the implementer prompt template: run long checks with `run_in_background` and wait for the completion notice.
  - Expose one scoped root command, `pnpm check --filter <ws>` (lint + type-check + test via turbo), so agents stop composing ad-hoc eslint/vitest/tsc loops.

### Automated checks: Codex had to work around pnpm's dependency verification

- **Evidence:** all four Codex logs prefix commands with `pnpm_config_verify_deps_before_run=false` (13, 3, 6 and 12 times). The sandbox has no network, and pnpm's pre-run install check fails there. #435 also reported app test timeouts from concurrent worker pressure, which passed with one worker.
- **Proposal:**
  - Set `verifyDepsBeforeRun: false` (or `warn`) in `pnpm-workspace.yaml` for agent runs, or document the variable in the Codex prompt.
  - Set a `maxWorkers` cap in `configs/vitest/defaults.ts` for app projects.

## Low

### Tool economy: the Codex hand-off had no fallback or commit path

- **Evidence:** Codex hit its usage limit mid-#436 and mid-#437 (reset 06:17), and Haiku resumed from partial logs. Codex's `workspace-write` sandbox cannot commit, because the shared `.git` sits outside the workspace. Every ticket needed a separate merger agent.
- **Proposal:**
  - Promote the session's `launch.sh` into `scripts/agent-launch.mjs`: it creates the worktree on the integration branch, installs, runs Codex with `--cwd`, and on a usage-limit failure writes a hand-off note.
  - Note in the implement-spec skill that Codex runs never commit.

### Coding standards: mixed commit trailers

- **Evidence:** `merger.md` hard-coded an Opus trailer. Haiku mergers followed their own harness attribution, and five reports asked which to use. Commits carry both.
- **Proposal:** delegated prompts tell sub-agents to use their own session's attribution, never a templated trailer.

### Tool economy: tool-name and read-before-write slips

- **Evidence:**
  - `No such tool available: bash` appeared in #438 and #443 phase 2.
  - `File has not been read yet` appeared in #436 and #438.
  - #440 ran `timeout`, which does not exist on macOS.
- **Proposal:** no environment change. These are model slips the harness already reports, and they cost one retry each.
