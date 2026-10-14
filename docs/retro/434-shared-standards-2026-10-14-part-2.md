# Retro: spec #434, part 2 (tickets #464–#477 and code review)

Scope: the orchestrator session after [part 1](434-shared-standards-2026-10-14-part-1.md), 28 Claude sub-agent sessions (12 implementers, 13 mergers, 3 reviewers/diagnosis), and the Codex task logs for #464–#477, the layout fix and the review fixes. Integration branch `feat/434-shared-standards`, PR #463.

`/retro` sets `disable-model-invocation`, so sub-agents cannot run it. The orchestrator ran it on their transcripts with a JSONL digest (tool counts, check runs, errors, blocked calls). Candidates are ordered by severity.

## High

### Automated checks: lint-driven rewrites changed behaviour

- **Evidence:** turning on `strictTypeChecked` (#476) led the implementer to rewrite code until lint passed. The school-lists `isStaff` guard lost its `kind === 'staff'` check, and `partnerFailure` started rethrowing mapped codes. Only the PostgreSQL integration suites caught both, at merge time. The rewrite also added an unused `..._expected` rest parameter, which passes because `configs/eslint/standards.js:117` allows any `^_` argument.
- **Proposal:**
  - Drop `argsIgnorePattern: '^_'` for rest and trailing parameters in `standards.js`, keeping it only for positional callbacks, so dummy parameters fail lint.
  - Add a `CODING_STANDARDS.md` judgement rule for the reviewer: "a lint fix that changes a condition, a thrown/returned value, or adds a cast or dummy parameter needs a test that pins the old behaviour."
  - Add one line to the implementer prompt template: run the owning package's integration suite after any lint-only change to service code.

### Navigation: shared list files are a merge-conflict hotspot

- **Evidence:** every context-package merge (#469–#475) conflicted in the same files. `pnpm-workspace.yaml` lists each package by name, and so do `configs/library-scopes.mjs`, `configs/eslint/activation.mjs`, the app `package.json` dependency blocks and `pnpm-lock.yaml`. Merges #469 and #472 had 21 and 10 conflicts, mostly list appends.
- **Proposal:**
  - Use the glob `packages/*` in `pnpm-workspace.yaml`.
  - Derive `libraryScopes` and the preset activation list from the workspace globs, listing only exclusions (for example `packages/domain-errors` until #445).
  - A new library package then touches only its own directory and its consumers.

### Information access: the main `.env` breaks production builds

- **Evidence:** `.env.example:2` sets `NODE_ENV=development`. Any agent that sources `.env` before `next build` makes `/_global-error` prerendering fail with "reading 'useContext'". That cost a bisect, a false "build broken" report from the #475 merger, and repeated reruns across five mergers.
- **Proposal:**
  - Remove `NODE_ENV` from `.env.example`; Next sets it per command.
  - Have `scripts/architecture/build-next-app.mjs` spawn `next build` with `NODE_ENV: 'production'` explicitly, so the build is correct however the shell is set up.

## Medium

### Tool economy: implementers re-ran broad checks dozens of times

- **Evidence:** package extractions made 100–200 tool calls each. #469 ran tsc 31 times and vitest 34; #474 ran tsc 22 times and vitest 39; #472 ran vitest 39 times. The scoped `pnpm check --filter <ws>` from part 1 was never built.
- **Proposal:** add a root `check` script (`turbo run lint type-check test --filter`) and point the implementer prompt at it. Agents then run one scoped command per iteration and the full suite once before handing back.

### Steps and completion: agents handed back before their checks finished

- **Evidence:** #473 sent 6 hand-backs and #469 sent 3, each saying "verification pending". Mergers #471 and #472 spent 34 and 66 calls polling with `Monitor`. The orchestrator had to stop two implementers and push their verification into the merge step.
- **Proposal:** make the hand-back the completion criterion in the implementer and merger templates: "hand back once, after every check you started has finished; list each with its exit code." Long checks should run with `run_in_background` and wait for the completion notice, not poll.

### Information access: the root integration run hides per-suite results

- **Evidence:** root `pnpm test:integration` runs seven suites serially. Mergers quoted only the last one ("7 files / 138 tests", which is backend alone), and the orchestrator had to rerun it to see all seven.
- **Proposal:** make the root script end with a one-line summary per suite, either through a small wrapper that parses each Vitest summary or by running the suites through turbo with `--summarize`.

### Tool economy: the Codex sandbox cannot finish a ticket

- **Evidence:**
  - Every Codex run needed a Claude merger to commit, because `.git` is read-only in the sandbox.
  - Codex couldn't run PostgreSQL integration (`EPERM`) or Next builds (SWC cache, stalls).
  - Its usage limit cut runs off twice.
  - After the session restart, two Codex jobs stayed marked "running" and blocked `--resume-last` until they were cancelled by hand.
  - Codex left stalled `next build` processes that it couldn't kill.
- **Proposal:**
  - Keep Codex for implementation only, and note in the implement-spec skill that the merger owns commit, integration and builds.
  - Before any resume, run `codex-companion.mjs status` and cancel jobs whose log hasn't changed in 10 minutes. This belongs in the session's launch script (`scratchpad/launch.sh`, which part 1 proposed promoting to `scripts/agent-launch.mjs`).

### Coding standards: the spec reviewer flagged pre-existing code as scope creep

- **Evidence:** the Spec-axis review (`af50acbc9f4d2c9aa`) reported the client-side `@findeg/db` block and the warning ratchet as new scope creep. Both already exist on `origin/develop`.
- **Proposal:** in `.claude/skills/code-review/SKILL.md`, have both axes check `git show <fixed-point>:<path>` before calling something new.

## Low

### Information access: deletions needed in-chat approval mid-run

- **Evidence:** the auto-mode safety check refused `rm` while #473 was moving identity files. The run paused until the user approved deletions inside sub-agent worktrees.
- **Proposal:** record the approved scope as a project allow rule, for example `Bash(git rm:*)`, or add one line to the AGENTS.md Worktrees section: "moves into packages use `git mv`/`git rm`." The user owns that setting.

### Coding standards: lint exemptions in activated libraries

- **Evidence:** `packages/partners/eslint.config.js` turns off `no-unnecessary-type-parameters` for `partnerFailure<E>`, whose `as E` cast hides a wider error union.
- **Proposal:** track per-file overrides in activated scopes in `violations.json` (a count per workspace) so #445 burns them down, and have the reviewer treat any new override as a finding.
