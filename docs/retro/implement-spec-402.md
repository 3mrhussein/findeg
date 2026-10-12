# Retrospective: implement spec #402

Date: 2026-10-12. Scope: the coding session that implemented [the `@findeg/domain` spec #402](https://github.com/3mrhussein/findeg/issues/402), tickets #403–#408, through [PR #433](https://github.com/3mrhussein/findeg/pull/433).

Integration branch: `feat/domain-package`. Base `f4e9ecf91`; reviewed and pushed through `7c5c2c042`.

This report applies the [retro skill](../../.agents/skills/retro/SKILL.md) and the [writing-for-agents guide](../../.agents/skills/writing-for-agents/SKILL.md). It proposes improvements to the agent environment. None of them has been implemented yet.

## Outcome and evidence

The work ran under the [implement-spec skill](../../.agents/skills/implement-spec/SKILL.md):

1. An exploration subagent wrote notes for each ticket.
2. Implementer subagents built the tickets in separate worktrees, following the dependency order (#403, then #404 and #406, then #405 and #407, then #408).
3. A two-axis review ran, and one subagent fixed the findings.

On `7c5c2c042`, the domain has 795 tests passing, type-check and lint are clean, and the architecture tests pass 37 of 37. The PR is marked ready. Two usage-limit interruptions paused the subagents, and each resumed cleanly.

| Observation | Evidence | Resolution during the session |
| --- | --- | --- |
| Phantom staged changes appeared twice, each undoing real commits | The main checkout and the integration worktree both had `feat/domain-package` checked out. A second agent (`findeg-codex[bot]`) committed `fc1cd8929` and `d15b08ef6` from the main checkout. Moving the branch from one checkout left the other with an index at an older commit. | Confirmed that the index tree matched an ancestor commit, then synced the worktree to origin. The main checkout still shows 44 phantom changes. |
| An instruction to "include the edits" nearly committed the phantoms | The staged files were exactly `3fd8e1978`. Committing them would have removed the Relation completeness and Delivery ownership sections that #442 and #434–#445 need. | Verified with `git write-tree` against candidate commits before acting. |
| A merge commit failed commitlint, and an earlier one slipped through | `Merge ticket #404…` was rejected. `Merge ticket #403…` (`2770a8872`) was committed before `pnpm install` had installed the hooks in the fresh worktree. | Used `chore(domain): merge …` messages afterwards. `2770a8872` remains on the branch. |
| Parallel tickets duplicated shared concepts | Review found a runtime import cycle between `orders` and `school-lists`, List Offer rules split across two areas with two error classes, two random-source types, and the time zone placed in `orders`. | Agents were coordinated by ad-hoc messages. A review-fix subagent (about 200k tokens) consolidated each concept and added `scripts/architecture/domain-import-cycles.test.mjs`. |
| Handoff decisions were stored only in the session scratchpad | #399 depends on the decisions each implementer recorded: id casting, digest payload, contact phone, and the compare-at clean-up. | Copied them into the PR body by hand. |
| The spec's wording conflicted with ADRs | Story 50 against ADR-0012, ADR-0014 and SL-13 on drafting while suspended. A null `endsAt` on a List Offer. Story 45 against ADR-0012 on the directory. The school logo against the media library. | The coordinator chose defaults and recorded them in the PR body. The logo question is still open for the owner. |
| The exploration agent type can't write files | `Explore` has no Write tool, but the skill needs the exploration agent to save notes. | The agent wrote its notes with bash heredocs. |

## Existing guardrails

- [Root scripts](../../package.json) run per-workspace lint, type-check and tests. `test:architecture` runs every `scripts/architecture/*.test.mjs`, which now includes the domain import-cycle test.
- [Pre-commit](../../.husky/pre-commit) runs lint-staged. [Commit-msg](../../.husky/commit-msg) runs commitlint with `@commitlint/config-conventional`.
- [PR conventions](../../.github/workflows/pr-conventions.yml) validates the PR title only. No CI job validates commit messages.
- `packages/domain` uses the `isomorphic` ESLint profile, which blocks Node, database and Next imports. Nothing deterministic enforces ADR-0018's ban on a clock, randomness or I/O.
- The [git-guardrails skill](../../.agents/skills/git-guardrails-claude-code/SKILL.md) exists, but nothing in the repo stops two sessions from checking out the same branch.

## Improvements, ordered by priority

### P1: One branch, one checkout

**Problem.** Two agents had `feat/domain-package` checked out at the same time. Each move of the branch turned the other checkout's files into phantom changes. One wrong commit would have silently reverted the review fixes or the delivery docs.

**Changes.**
- Add one line to `AGENTS.md`, read by both Claude and Codex: a branch listed in `git worktree list` belongs to the session working there, so each session works in its own worktree.
- Add a PreToolUse hook through the git-guardrails skill. It refuses `--ignore-other-worktrees`, and refuses a `checkout` or `switch` to a branch that another worktree has checked out.
- Change implement-spec step 3 to write the integration worktree path into the draft PR body, so another agent can see the branch is taken.

**Done when** a second `git switch feat/x` aimed at a branch held by another worktree is refused before it runs.

### P1: Commit messages are checked everywhere

**Problem.** A fresh worktree has no git hooks until `pnpm install` runs, and CI doesn't check commit messages. A non-conventional merge commit therefore reached the branch.

**Changes.**
- Change implement-spec step 5 to merge with git's default message (`git merge --no-ff <branch>`). The default `Merge branch '…'` is on commitlint's default ignore list.
- Add a commitlint job to [CI jobs](../../.github/workflows/ci-jobs.yml) that checks the PR's commit range.

**Done when** a PR with a non-conventional commit fails CI.

### P2: Tickets name the home of each shared concept

**Problem.** #405, #406 and #407 ran in parallel. Each one created its own copy of a concept the others also needed. The coordinator assigned homes in mid-flight messages, and review caught what the messages missed.

**Change.** Have the [to-tickets skill](../../.agents/skills/to-tickets/SKILL.md) require that, when two tickets touch the same concept, each ticket states the concept's home (for example "List Offer: `school-lists`"). The import-cycle test already guards against the runtime-cycle part.

**Done when** every concept touched by more than one ticket has exactly one stated home before implementation starts.

### P2: Handoff decisions go to the tracker

**Problem.** Implementer handoff notes lived in the session scratchpad, which doesn't outlast the session. The next spec, #399, depends on them.

**Change.** Have implement-spec step 4 require each implementer to post its decisions for later tickets as a comment on its own ticket (`gh issue comment`). Scratchpad notes stay for exploration only.

**Done when** each closed ticket carries a decisions comment that a later spec can point at.

### P3: Domain purity is linted

**Problem.** Review checked ADR-0018's ban on a clock, randomness and I/O by hand. It is a fixed code pattern that a linter can check.

**Change.** In `packages/domain/eslint.config.js`, add `no-restricted-properties` for `Date.now` and `Math.random`, and `no-restricted-globals` for `crypto`.

**Done when** adding `Date.now()` inside `packages/domain/src` fails lint.

### P3: Specs are checked against the ADRs they cite

**Problem.** Four conflicts between story wording and ADRs came to light only during exploration.

**Change.** Have the [to-spec skill](../../.agents/skills/to-spec/SKILL.md) check each user story against the ADRs it cites before publishing, and list each conflict as a question for the owner.

**Done when** a published spec has no user story that contradicts an ADR it cites, unless the story is marked as amending that ADR.

### P3: Exploration uses an agent type that can write

**Change.** Have implement-spec step 2 name `general-purpose` as the exploration agent type, since `Explore` has no Write tool.

## Cost notes

Approximate subagent tokens:

| Subagent | Tokens |
| --- | --- |
| Exploration | 372k |
| #403 | 147k plus its pre-interruption run |
| #404 | 164k |
| #405 | 260k |
| #406 | 208k |
| #407 | 216k |
| #408 | 217k |
| Standards review | 79k |
| Spec review | 181k |
| Review fixes | 208k |

The review-fix pass was avoidable: P2 (shared concepts) would have prevented most of it.
