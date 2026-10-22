# Consolidated retrospective improvement report

Reviewed: **2026-10-20 (Africa/Cairo)** against `origin/develop` at **699e10345db576965e1db5fbb7de9caf2045944a**.

This report replaces four retrospectives from 9–14 October. It merges repeated recommendations, rechecks their premises against develop, and keeps resolved and superseded findings out of the active queue. This is a documentation change; it implements none of the remaining recommendations.

## How to use the states and priorities

- `[ ] Open`: the inspected repository still has the gap.
- `[ ] Partial`: an observed defect or part of the recommendation is fixed; the stated remainder is open.
- `[ ] Unverified`: historical evidence supports investigation, but current external tooling or runtime capability was not established.
- `[ ] Optional`: a bounded improvement to consider only when the need recurs.
- `[x] Done`: repository evidence addresses the recommendation.
- `[x] Superseded` or `[x] No action`: the original prescription no longer fits the architecture or does not justify a repository change.

A checked box means **closed for this queue**, not necessarily implemented. Keep the explicit state when changing a checkbox. P1 comes first because it protects behavior, publication integrity or trustworthy verification; P2 closes coverage and coordination gaps; P3 improves ergonomics. These are improvement priorities, not production incident severities. Owners below are suggested roles, not assignments.

## P1 — Correctness and trustworthy completion

### R01 — [ ] Implemented; merge pending: make production builds independent of a development shell

**Owner:** app build maintainer. **Source:** C3.

**Current evidence:** [#489](https://github.com/3mrhussein/findeg/issues/489), implemented in open [PR #504](https://github.com/3mrhussein/findeg/pull/504), branch `fix/retro-r01-production-build-env` (FindEg retro automation). [`.env.example`](../.env.example) leaves mode selection to Next.js; [the build wrapper](../scripts/architecture/build-next-app.mjs) forces production only for its child. [Child-process regression tests](../scripts/architecture/build-next-app.test.mjs) cover inherited development/test/production/unset modes, environment forwarding, failure propagation, and map cleanup after success, build failure and verification failure. The mode tests failed before the fix and pass afterward. A real Next.js development startup observed `NODE_ENV=development` with no verification flag. C3's historical prerender failure remains historical evidence, not a reproduced incident. This implementation awaits PR review and merge; the checkbox remains open.

**Recommendation:** remove `NODE_ENV` from the example and explicitly set production for the child build. Keep verification-map cleanup.

**Validation (2026-10-20):** all 105 architecture tests pass, including the child-environment and cleanup regressions. Dashboard and Storefront production builds both pass when launched with `NODE_ENV=development` against a disposable migrated/seeded PostgreSQL database; each verifies 40 client chunks and leaves no verification maps. Real Next.js development startup, focused Node lint and formatting checks pass. Local SWC native-cache access required a temporary writable cache directory; no dependency or configuration changes were committed for that environment setup.

**Done when:** a build launched from a shell with `NODE_ENV=development` uses production mode, and normal development commands retain their expected mode.

### R02 — [ ] Implemented in task branch, awaiting PR: preserve behavior when fixing lint

**Owner:** standards and context maintainers. **Sources:** C1, A6.

**Baseline evidence (before R02):** [the workaround audit](../configs/eslint/README.md) records the repaired `partnerFailure` mapping and removal of its dummy rest parameter. [Shared standards](../configs/eslint/standards.js) still exempt all underscore arguments; [implementation guidance](../.agents/skills/implement/SKILL.md) does not require the owning integration suite after service behavior changes.

**Recommendation:** require regression coverage when lint edits change guards, return/throw behavior, casts or dummy signatures. Narrow unused-argument exceptions using supported ESLint options or fixtures without rejecting required callback positions. Run owning PostgreSQL tests for affected service behavior, and stop mutation workflows on failed required checks.

**Done when:** a guard/mapping regression fails the owning tests, a dummy parameter is rejected, and a required positional callback remains valid. Do not reopen the already repaired runtime defects.

**Implementation evidence (R02 / [#490](https://github.com/3mrhussein/findeg/issues/490)):** `fix/retro-r02-lint-behavior` replaces the blanket underscore exemption with supported `args: 'after-used'` and an explicit workspace/file/name list for pre-existing ignored compatibility inputs. Fixtures verify that the exception files still reject dummy rest parameters and that legacy names are rejected outside their listed files; unrelated CSV-import/filter placeholders remain unchanged and explicitly documented. Complete-preset CLI fixtures reject trailing/dummy-rest parameters and accept required callback positions and port signatures; the recommended tier has its own fixture. Both negative fixtures fail against the prior standards. Partners guard/mapping tests cover known mappings, non-Domain lookalikes and unmapped/inherited property names; replacing the own-property guard with `in` produces two test failures. The repaired service implementation is unchanged. Implementation guidance now requires owning runtime regressions and PostgreSQL suites for service behavior changes, with failed/blocked required checks stopping publication. Validation passed: all 109 architecture tests, all 15 workspace lint commands, 111 Partners unit tests, 100 database unit tests, and Config/Partners/database type checks. PostgreSQL integration, application builds and E2E were not run locally: service and query behavior are unchanged; the database edit removes an uncalled, ignored parameter and its owning unit test preserves the existing query. PR status will be linked before handoff; the checkbox remains open until merge.


### R03 — [ ] Partial: reject accidental merge-conflict markers

**Owner:** CI and hook maintainer. **Sources:** A10, B4.

**Current evidence:** [Backend README](../backend/README.md) is repaired. [Pre-commit](../.husky/pre-commit) still runs formatting only; [CI jobs](../.github/workflows/ci-jobs.yml) contain no explicit conflict-marker check.

**Recommendation:** add staged diff validation and a deterministic CI check, handling intentional examples explicitly. A diff check protects changed lines; scan tracked content too if the contract is to reject pre-existing markers. Introduce package-aware staged lint only with verified package/config behavior.

**Done when:** an accidental marker fails the existing check contract, intentional examples pass, and check failures prevent the owning mutation workflow from continuing.

### R04 — [ ] Unverified: protect concurrent tracker publication

**Owner:** tracker tooling maintainer. **Source:** D1.

**Current evidence:** [tracker guidance](agents/issue-tracker.md) documents direct `gh` mutations; no reusable checked publisher was found under repository scripts. D1's temporary publisher checked all 44 bodies before sequential edits, leaving a later-write race window. No overwrite was demonstrated; that temporary script was not available as durable evidence here.

**Recommendation:** re-read each target immediately before writing, compare it with the approved preimage, skip unchanged bodies, journal outcomes and verify read-back. Reject drift and support interrupted-run recovery. Immediate rechecks reduce the race; do not describe them as atomic compare-and-swap without platform support.

**Done when:** fixture tests cover changed preimages, no-op writes, partial failure and resume; a changed remote body is not silently overwritten.

### R05 — [ ] Open: provide one scoped verification workflow with a complete receipt

**Owner:** shared tooling maintainer. **Sources:** A6, B5–B6, C4, C6.

**Current evidence:** [root scripts](../package.json) expose separate lint/type/test/build commands and seven serial integration workspaces, but no combined `check` or per-workspace result receipt. [Shared Vitest policy](../configs/vitest/policy.mjs) has no worker cap. The retros reported contention timeouts and repeated broad checks; these remain historical observations, not fresh test results.

**Recommendation:** compose existing commands into a scoped check and serialize expensive final phases: workspace checks, builds, then browser tests. Capture immutable HEAD, workspace/phase names, exit codes, logs, database identity/readiness and owned cleanup resources. Include every integration workspace's result, even when an earlier suite fails; preserve failure status. Use available ports and tune workers only from measured contention.

**Done when:** one invocation produces a bounded receipt, a deliberate phase failure returns nonzero, no pending phase is called passing, and cleanup touches only owned resources. Preserve assertions and timeout budgets.

### R06 — [ ] Open: make hand-back and verification ownership explicit

**Owner:** agent workflow maintainer. **Sources:** B5, B7, C5, C7.

**Current evidence:** [implement-spec](../.agents/skills/implement-spec/SKILL.md) defines implementer/merger roles without a finished-check receipt or capability-based fallback. Historical Codex jobs needed separate commit/build/integration owners; that does not establish a permanent restriction on every current Codex session.

**Recommendation:** hand back once all started checks finish, listing each exit code or explicit blocker. Use the available harness completion notifications instead of tight polling. Before dispatch, assign commit/build/integration ownership according to actual capabilities. A launcher may persist a minimal handoff on quota exhaustion, record job/process ownership and inspect job state before resume. Do not cancel work solely because its log is quiet for ten minutes.

**Done when:** quota interruption or a blocked check yields a resumable handoff, stale job state is reconciled safely, and no report claims success while its checks are still running. Do not prescribe unavailable historical tool names as universal commands.

## P2 — Coverage, contracts and coordination

### R07 — [ ] Partial: make aggregation fixture ownership durable

**Owner:** PostgreSQL test maintainer. **Source:** A7.

**Current evidence:** [Orders statistics fixtures](../packages/orders/src/features/integration/__tests__/orders-stats.integration.test.ts) use 2027 ranges, addressing the observed 2026 collision. [Integration policy](../configs/vitest/integration.ts) serializes files against a run database; serialization alone is not row isolation. No calendar reservation registry was found.

**Recommendation:** reserve aggregate ranges through a small shared fixture contract and detect reuse. Document serialization versus isolation. Choose rollback or suite isolation only after accounting for multi-connection and concurrency tests; avoid blanket truncation.

**Done when:** aggregate suites pass alone, together and in reversed order with exact DST boundaries; a duplicate reservation fails deterministically.

### R08 — [ ] Partial: test Orders through the real Dashboard home route

**Owner:** Dashboard acceptance-test maintainer. **Source:** A5.

**Current evidence:** [the widget test](../frontend/dashboard/src/app/[locale]/(dashboard)/_components/DashboardOrdersWidget.test.tsx) checks exact revenue, statuses and links. [Seeded browser journeys](../frontend/dashboard/cypress/e2e/dashboard-journeys-e2e.cy.ts) cover the Orders list, not the home widget. The other inspected Cypress cases exercise Order operations rather than this home requirement.

**Recommendation:** extend existing browser fixtures to assert accepted revenue, all seven statuses, a recent reference and localized detail navigation from home in English and Arabic.

**Done when:** removing the Orders section from the actual home route fails the scenario in the existing strict-tier runner. Retain the cheap exact-bigint widget test.

### R09 — [ ] Partial: define net subtotal at the public Orders contract

**Owner:** Orders and Dashboard maintainers. **Source:** A8.

**Current evidence:** [`Order.subtotal`](../packages/orders/src/types.ts) still lacks an adjacent net-semantics explanation. [Acceptance](../packages/orders/src/features/order-acceptance/helpers.ts) persists `netSubtotal`; [the UI test](../frontend/dashboard/src/app/[locale]/(dashboard)/orders/[id]/_components/OrderTotals.test.tsx) already covers gross display. The original display defect was fixed.

**Recommendation:** document net subtotal at the public type and add visible discounted-Order coverage produced through Acceptance, preserving Domain ownership of calculations.

**Done when:** the contract explains gross = net subtotal + discount, and a producer-derived accepted snapshot reconciles net 35.00, gross 37.50, discount 2.50, shipping 10.00 and total 45.00 in the UI.

### R10 — [ ] Partial: keep application test aliases aligned with TypeScript

**Owner:** frontend test configuration maintainer. **Source:** A9.

**Current evidence:** [Dashboard Vitest](../frontend/dashboard/vitest.config.ts) now includes `@data`, fixing the original import failure, but still manually duplicates only part of [the TypeScript alias map](../frontend/dashboard/tsconfig.json).

**Recommendation:** derive app-local aliases or enforce deterministic parity. Keep workspace package imports on actual public export resolution instead of introducing aliases to package internals.

**Done when:** one new local alias resolves in TypeScript and Vitest after one source edit; unpublished Orders subpaths remain rejected.

### R11 — [ ] Open: report source-map failure identity before cleanup

**Owner:** build verifier maintainer. **Source:** A3.

**Current evidence:** [`sources()`](../scripts/architecture/client-bundle.mjs) still throws `Client source map has no module sources` without chunk/map identity; JSON parsing and map reads also lack audit context. [The wrapper](../scripts/architecture/build-next-app.mjs) correctly removes maps in `finally`.

**Recommendation:** wrap parser/audit failures with relative chunk/map names, map shape/counts and rejection reason; retain bounded diagnostic metadata where useful.

**Done when:** an unknown empty-map artifact is identifiable in one failing run, arbitrary unmapped code remains rejected, and deployment output has no verification maps. Keep the existing narrow forwarding exception.

### R12 — [ ] Open: enforce route/data conventions and directive placement

**Owner:** frontend standards maintainer. **Source:** A4, revised for ADR-0020.

**Current evidence:** [Storefront ESLint](../frontend/storefront/eslint.config.js) delegates to the shared Next profile; inspected architecture rules do not enforce route-to-data composition or misplaced `use client`. [ADR-0020](adr/0020-domain-single-source-and-bounded-context-packages.md) assigns client/server enforcement to Next.js.

**Recommendation:** add narrow fixtures for route value imports that bypass the documented App Data Layer and directives displaced after imports. Allow erased types and pure values; use `server-only` in app query modules for the actual framework boundary. Do not revive custom package-level client-bundle policy.

**Done when:** the original route/directive mistakes fail an existing mechanical check, valid data composition passes, and a Client Component reaching a marked query fails the Next build.

### R13 — [ ] Partial: refresh develop before each implementation wave

**Owner:** orchestration maintainer. **Source:** B2.

**Current evidence:** [AGENTS](../AGENTS.md) requires fresh develop before implementation, and [worktree creation](../scripts/worktree.mjs) attempts a fetch before creating new branches. [Implement-spec](../.agents/skills/implement-spec/SKILL.md) does not define between-wave refresh or predecessor coordination; the worktree script uses a best-effort fetch.

**Recommendation:** surface fetch failures, check predecessor delivery state, and refresh develop before dispatching each new wave. Coordinate required predecessor PRs rather than blocking on every unrelated open PR. Verify existing-branch ancestry separately from new-branch creation.

**Done when:** stale or unavailable upstream state is explicit before dispatch and dependent work starts from the intended integrated baseline.

### R14 — [ ] Partial: bootstrap worktrees inside actual writable scope

**Owner:** worktree/orchestration maintainer. **Sources:** A additional worktree bootstrap, B3, C9.

**Current evidence:** [worktree tooling](../scripts/worktree.mjs) now uses `.worktrees/`, accepts a custom path and bases new branches on develop. The old report's default `worktree/` path is obsolete. It still has no explicit integration `--base` option or dispatch-time capability probe.

**Recommendation:** verify intended ancestry, writable path, dependency setup and isolated database access before assigning work. Consider an explicit base option for integration tasks. Use normal tracked moves/removals within approved scope; report a blocked edit and obtain the required environment grant rather than switching tools to evade it.

**Done when:** normal edits/install/checks work in the assigned checkout, root remains untouched, and denied operations produce an actionable handoff. Broad permission allowlists and blanket deletion authorization are not repository fixes.

### R15 — [ ] Open: reduce duplicated workspace registries

**Owner:** shared configuration maintainer. **Source:** C2.

**Current evidence:** [workspace registration](../pnpm-workspace.yaml), [library scopes](../configs/library-scopes.mjs) and [`completeScopes`](../configs/eslint/standards.js) still enumerate packages. The historical `configs/eslint/activation.mjs` path no longer exists.

**Recommendation:** evaluate `packages/*` registration and derive shared classifications from canonical workspace metadata with explicit policy exceptions. Keep consumer dependencies and the lockfile explicit; those cannot all be removed by discovery.

**Done when:** adding a library does not require redundant registration/policy list appends, while app/UI exclusions and preset/coverage activation remain deliberate and tested.

### R16 — [ ] Open: ground reviews in the baseline and actual entry points

**Owner:** review workflow maintainer. **Sources:** A11, C8.

**Current evidence:** [code review](../.agents/skills/code-review/SKILL.md) pins a fixed point and uses a three-dot diff but does not explicitly require baseline-file inspection before scope-creep claims or user-visible requirement tracing through unchanged routes.

**Recommendation:** inspect `git show <fixed-point>:<path>` before classifying behavior as introduced; map every visible requirement through its real route/control and public call path. Read bounded diffs per requirement and avoid truncated evidence. Optionally provide a merge helper that validates cleanliness/ancestry and merges an immutable SHA with a compact receipt.

**Done when:** pre-existing behavior is not reported as new scope, an omitted route integration is caught, and any merge helper rejects dirty/wrong/non-descendant inputs. Preserve independent Standards and Spec review axes.

### R17 — [ ] Unverified: promote tracker graph verification into reusable tooling

**Owner:** tracker tooling maintainer. **Source:** D3.

**Current evidence:** no graph validation CLI was found in repository scripts; [tracker guidance](agents/issue-tracker.md) documents native blockers and sub-issues. D3's zero-cycle checkpoint for 45 issues is historical, not a current tracker result.

**Recommendation:** validate cycles, body/native blocker parity and parent relationships against a versioned publication plan. Separate fixture-based checks from authenticated live verification; do not hard-code historical labels or require every issue to remain open.

**Done when:** deterministic fixtures catch graph/relationship errors, and a live snapshot can be checked against an identified plan revision. Coordinate with R04 without duplicating its mutation logic.

### R18 — [ ] Open: distinguish accepted baselines from implementation and merge state

**Owner:** tracker workflow maintainer. **Source:** D2.

**Current evidence:** [tracker guidance](agents/issue-tracker.md) does not distinguish implemented, accepted for planning, awaiting merge and active follow-up ownership. D2 records that the original metadata mismatch was corrected during its session.

**Recommendation:** document those states and distinguish optional design concerns from genuine blockers; update continuation guidance after an explicit owner decision.

**Done when:** a reviewer can identify the accepted baseline, merge state and follow-up owner without reopening settled design. Do not reapply historical `needs-info` labels to #402/#405/#411.

### R19 — [ ] Partial: express dependencies at deliverable granularity

**Owner:** ticket-planning workflow maintainer. **Source:** D4.

**Current evidence:** [to-tickets](../.agents/skills/to-tickets/SKILL.md) already asks whether blockers genuinely gate a ticket, supports expand/contract and uses native relationships. It does not explicitly distinguish a required phase from the entire parent deliverable.

**Recommendation:** identify the exact prerequisite deliverable. If a separately delivered phase is sufficient, make it independently closable rather than suggesting prose phases bypass an open native blocker.

**Done when:** dependency review checks both necessity and closability, in addition to acyclicity. The old #415 edges are historical examples, not instructions to edit today's tracker.

### R20 — [ ] Open: version handoffs and bound tracker reads

**Owner:** handoff/tracker workflow maintainer. **Sources:** D5–D6.

**Current evidence:** [handoff guidance](../.agents/skills/handoff/SKILL.md) already favors pointers and avoids duplication, but lacks dated amendments or expected-revision manifests.

**Recommendation:** separate immutable evidence from current continuation instructions; amend/regenerate the reviewer entrypoint after later owner decisions. Cache a timestamped snapshot, derive reverse dependencies locally and fetch targeted follow-up fields/comments. Keep the entrypoint short with matrices/logs linked separately.

**Done when:** a later decision invalidates stale expectations explicitly, reviewers know which revision governs, and follow-up reads refresh only the needed data.

### R21 — [ ] Partial: keep justified lint exceptions visible

**Owner:** standards maintainer. **Source:** C10.

**Current evidence:** [partners ESLint](../packages/partners/eslint.config.js) retains a narrow output-generic exception, explained in [the workaround audit](../configs/eslint/README.md). The old ratchet/violations JSON was removed; [compatibility documentation](../configs/compatibility.md) records that removal.

**Recommendation:** review new per-file overrides and maintain a small inventory or deterministic comparison of approved exceptions, using current tooling. Distinguish justified compatibility exceptions from deferred migrations.

**Done when:** a new override is visible in review/check output and each retained exception has scope, rationale and an owner. Do not restore an obsolete `violations.json` ratchet merely to implement the old wording.

## P3 — Bounded ergonomics

### R22 — [ ] Partial: document dependency verification for constrained runs

**Owner:** agent environment maintainer. **Source:** B6.

**Current evidence:** [compatibility notes](../configs/compatibility.md) already document a preinstalled-worktree verification bypass, and [shared-config tests](../scripts/architecture/shared-config.test.mjs) set it locally. There is no repository-wide setting; current network/install failure was not reproduced.

**Recommendation:** move any still-needed advice into the relevant environment bootstrap, verify installed dependencies first, and scope exceptions to that environment. R05 owns measured resource contention.

**Done when:** a constrained run has a documented, reproducible setup without silently disabling dependency checks for ordinary developer/CI runs.

### R23 — [ ] Optional: reuse immutable Order snapshot fixtures

**Owner:** Orders test maintainer. **Source:** A additional immutable fixture navigation.

**Current evidence:** the original attempt to mutate frozen snapshot money was correctly rejected; [current Orders fixtures](../packages/orders/src/__tests__/fixture.ts) provide an existing reuse point. No missing production invariant was demonstrated.

**Recommendation:** extend an existing fixture helper only if repeated callers need atomic accepted snapshots; add a narrow testing pointer.

**Done when:** callers create valid immutable snapshots without weakening freeze-trigger coverage or introducing a second acceptance implementation.

### R24 — [ ] Unverified: remove hard-coded model attribution from delegated prompts

**Owner:** agent prompt maintainer. **Source:** B8.

**Current evidence:** B8 reported mixed trailers in historical merger prompts. No tracked implementer/merger template or launcher carrying that trailer was found in this checkout; external prompt configuration was not inspected.

**Recommendation:** if the template still exists, let each session follow its own attribution contract instead of a hard-coded model name.

**Done when:** a delegated commit has only the attribution required by its active harness. No speculative global attribution rewrite is proposed.

## Closed and superseded findings

- [x] **S01 — Done: architecture regression CI wiring (A1).** [Root command](../package.json), [the architecture job](../.github/workflows/ci-jobs.yml) and [policy invariants](../.github/scripts/policy/main-invariants.test.mjs) now cover this. Architecture is a separate job participating in the final verdict; it is not limited to affected-package discovery. Runtime pass status was not re-established here.
- [x] **S02 — Done: exclusive recursive library layout (B1).** [The rule](../scripts/architecture/rules/library-layout.js), [negative fixtures](../scripts/architecture/library-layout.test.mjs) and [standards text](../CODING_STANDARDS.md) now reject free-named directories below `src/`. The historical rule path moved from `configs/eslint/rules` to `scripts/architecture/rules`. R16 covers reading authoritative requirements before reviewing their enforcement.
- [x] **S03 — Superseded: recreate old Backend pure-facade tests (A2).** [ADR-0020](adr/0020-domain-single-source-and-bounded-context-packages.md) moved business APIs to contexts; [Backend export tests](../scripts/architecture/backend-infrastructure.test.mjs) reject old Core schema/business paths. [Orders runtime](../scripts/architecture/orders-runtime.test.mjs) and [public entry tests](../packages/orders/src/__tests__/public-entries.test.ts) already exercise real exports and configuration-free use. Add future import regressions at current owners when a concrete gap is found, not against removed facades.
- [x] **S04 — Superseded: old client-specific package/barrel enforcement (the boundary premise in A2/A4).** [ADR-0020](adr/0020-domain-single-source-and-bounded-context-packages.md) and [current ESLint notes](../configs/eslint/README.md) explicitly assign this to Next.js. Preserve app `server-only` boundaries and emitted-bundle verification. R12 retains the distinct route/data and directive-placement gaps.
- [x] **S05 — Done: repair conflicting Backend navigation (the README part of A10/B4).** [Backend README](../backend/README.md) now states infrastructure ownership, context delegation, current commands and ADR pointers without conflict markers. Preventing recurrence remains R03.
- [x] **S06 — Superseded: blanket “Codex never commits/builds/runs integration” (B7/C7).** Those were session-specific capability observations. Assign current capability and explicit ownership under R06/R14; do not convert old sandbox errors into a permanent tool restriction.
- [x] **S07 — Superseded: restore a `violations.json` counter (C10's mechanism).** The old ratchet was removed. Keep the remaining exception-accountability goal under R21 using current tooling.
- [x] **S08 — No action: tool-name/read-before-write/macOS command slips (B9).** The original report classified these as one-retry model errors already reported by the harness. They do not justify another standing repository rule.

## Source coverage and historical evidence

The source files are removed by this consolidation. Their complete text remains available at the reviewed commit via these immutable links. A/D recommendation numbers refer to the original R/numbered entries; B/C heading numbers count improvement candidates in reading order.

| Source | Original scope and immutable file | Coverage in this report |
| --- | --- | --- |
| A | [Orders #361 retrospective](https://github.com/3mrhussein/findeg/blob/699e10345db576965e1db5fbb7de9caf2045944a/docs/retro/implement-spec-361.md), 2026-10-09; [PR #379](https://github.com/3mrhussein/findeg/pull/379) | R1 → S01; R2 → S03/S04; R3 → R11; R4 → R12/S04; R5 → R08; R6 → R02/R03/R05; R7 → R07; R8 → R09; R9 → R10; R10 → R03/S05; R11 → R16; extras → R14/R23 |
| B | [Shared standards #434, part 1](https://github.com/3mrhussein/findeg/blob/699e10345db576965e1db5fbb7de9caf2045944a/docs/retro/434-shared-standards-2026-10-14-part-1.md), 2026-10-14; [PR #463](https://github.com/3mrhussein/findeg/pull/463) | 1 layout → S02/R16; 2 stale integration → R13; 3 edit guard → R14; 4 conflict markers → R03/S05; 5 polling/checks → R05/R06; 6 dependency verification/workers → R05/R22; 7 launcher/commit → R06/S06; 8 trailers → R24; 9 tool slips → S08 |
| C | [Shared standards #434, part 2](https://github.com/3mrhussein/findeg/blob/699e10345db576965e1db5fbb7de9caf2045944a/docs/retro/434-shared-standards-2026-10-14-part-2.md), tickets #464–#477 and review | 1 lint behavior → R02; 2 shared registries → R15; 3 build environment → R01; 4 broad checks → R05; 5 early hand-back → R06; 6 integration summaries → R05; 7 sandbox/resume → R06/S06; 8 baseline review → R16; 9 deletion approvals → R14; 10 overrides → R21/S07 |
| D | [Planning/tracker retrospective](https://github.com/3mrhussein/findeg/blob/699e10345db576965e1db5fbb7de9caf2045944a/docs/business/2026-10-12-findeg-session-retrospective.md), 2026-10-12 | 1 concurrent edits → R04; 2 accepted status → R18; 3 graph verifier → R17; 4 deliverable blockers → R19; 5 handoff revisions → R20; 6 read economy → R20 |

Historical observations remain useful evidence of recurrence, not current pass/fail results. A recorded full verification run reached 504 PostgreSQL tests and 18 English/Arabic Order operation cases after fixes; B/C recorded merge conflicts, lint-induced behavior regressions, build-environment failures and quota/sandbox interruptions. D recorded a 45-issue zero-cycle checkpoint. Those counts were not rerun or promoted to current guarantees.

A combines direct role retrospectives with an explicitly reconstructed original Standards reviewer record. B/C were orchestrator syntheses of transcripts, not direct sub-agent executions of the disabled-invocation retro skill. Temporary `/private/tmp` logs, local launchers and session-only grants were not recovered for this review. Current repository state supports the classifications above; untracked/external tooling may exist elsewhere. PRs #379 and #463 were verified merged. No live tracker graph audit, application tests, database suites or production builds were run for this documentation-only change.

## Guardrails to preserve

Keep Domain as the source of business values/rules, contexts as business-operation owners and Backend as infrastructure/composition. Preserve real package export tests, PostgreSQL behavior/concurrency tests, independent Standards/Spec reviews, exact money and Cairo DST assertions, actual browser workflows, fail-closed emitted-bundle audits, source-map cleanup, and isolated worktree ownership. Reuse existing CI/test contracts rather than creating a parallel pipeline or a large always-loaded instruction block.
