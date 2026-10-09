# Retrospective: implement spec #361

Date: 2026-10-09. Scope: the current coding session implementing [Orders extraction #361](https://github.com/3mrhussein/findeg/issues/361), principally tickets #367 and #368, through [PR #379](https://github.com/3mrhussein/findeg/pull/379).

Integration branch: `feat/implement-spec-361`. Implementation reviewed through `f2e33a79103359296c526d91aba3a3d9d1bf667b`; base `4a8a36a23a12f0d5044690db416dbde6348813fc`.

This report applies the repository's [retro skill](../../.agents/skills/retro/SKILL.md) and [writing-for-agents guide](../../.agents/skills/writing-for-agents/SKILL.md). It proposes improvements to the agent environment. Recommendations below have not been implemented as part of this retrospective.

## Outcome and evidence

The implementation completed public Orders consumers, exact Cairo statistics, Dashboard home widgets, customer ownership/prefill, and removal of legacy adapters. Final local verification passed 27 workspace tasks, 504 PostgreSQL tests, 31 architecture tests, production builds auditing 42 Dashboard and 46 Storefront client chunks, customer runtime smoke checks, and all 18 English/Arabic Order operations Cypress cases. The PR was marked ready; merge and remote CI completion were outside the session's final verified outcome.

Several problems appeared only when verification broadened beyond focused tests:

| Observation | Evidence | Resolution during implementation |
| --- | --- | --- |
| Dashboard home did not consume new Orders queries | Independent Spec review traced the actual home route | Mounted the Orders section and added an exact-value widget test in `6a98b18c0` |
| Account routes composed services directly; a client directive was displaced | Independent Standards review compared routes with the App Data Layer README | Moved reads into authenticated data queries and restored the directive in `6a98b18c0` |
| Focused statistics tests passed but full integration found three incorrect totals | Existing fixtures shared the same 2026 calendar ranges | Moved statistics fixtures to independent 2027 DST ranges; full suite passed 504 tests |
| Dashboard client chunks contained DB/ORM, then Env and session infrastructure | Actual production source-map audit | Narrowed pure imports in `070c85a80` and `4d70fe2af` |
| Four Cypress stale-transition cases displayed old state after reload | First browser run passed 14/18; rejection toasts were correct but cached reads remained stale | Authorized command attempts now invalidate caches even on rejection; final run passed 18/18 |
| A valid generated forwarding chunk had an empty source map | Build failed without chunk identity; diagnostic raw build exposed the artifact | Added an exact forwarding-grammar exception and negative tests in `f2e33a791` |
| Storefront unit tests exceeded five seconds during overlapping builds | Two loaded runs failed on different tests; quiet reruns passed | Serialized final verification; no timeout or assertion relaxation |

## Existing guardrails

The repository already has substantial guardrails. This is a coverage and orchestration retrospective, not a proposal to create a second check system.

- [Root scripts](../../package.json) run workspace lint, type checks, unit tests, integration tests, builds, and E2E through the existing package contracts.
- [CI jobs](../../.github/workflows/ci-jobs.yml) run lint/types/unit tests, database-backed builds, conditional integration tests, and strict-tier Cypress. [Feature CI](../../.github/workflows/ci.yml) intentionally omits E2E; strict CI requires it.
- Pre-commit runs Prettier via [lint-staged](../../.lintstagedrc.json). [Pre-push](../../.husky/pre-push) validates branch names; commit-message validation was effective during this session.
- Both app builds invoke [build-next-app.mjs](../../scripts/architecture/build-next-app.mjs), including an audit of actual emitted browser modules. [Turbo inputs](../../turbo.json) include architecture scripts for build-cache invalidation.
- Orders boundaries and client-safe import patterns have custom ESLint rules. Two independent review axes caught behavior and standards issues before completion.

The root AGENTS file is mostly navigation and installed-tool guidance. The inspected global `/Users/amr/.codex/AGENTS.md` was empty. No evidence supports a general AGENTS rewrite or adding more always-loaded instructions.

## Remaining improvements, ordered by priority

Priority describes recurrence and detection cost in future agent runs. P1 is the first environment change to make; P2 follows; P3 is a bounded workflow refinement. These are not new production defect severities.

### R1 — P1: wire the existing architecture regression suite into required checks

**Category:** Automated checks. **Owner:** CI/configuration maintainer. **Contributors:** consumer implementer, merger, final Standards reviewer, coordinator.

**Evidence:** `scripts/architecture/*.test.mjs` passed 31 tests when invoked manually. Root `test` discovers workspace Vitest contracts, not these Node tests. CI's policy-test step runs `.github/scripts/*.test.mjs`, and repository searches found no package script, hook, or CI step running the architecture suite. The actual bundle verifier is wired into builds; its negative regression tests are not.

**Change:** Expose one root `test:architecture` command and run the existing suite in the normal CI check contract. Ensure a scripts-only or shared-ESLint-rule-only change schedules it independently of affected-package discovery. Preserve the real production bundle audit.

**Completion:** A deliberate regression accepting a forbidden import or arbitrary unmapped executable chunk fails required CI through the existing tests. A scripts-only diff visibly executes the suite. This needs executable wiring, not a new coding-standard paragraph.

### R2 — P2: add fast import-safety tests for advertised pure entry points

**Category:** Automated checks. **Owner:** Backend/package boundary maintainer. **Contributor:** consumer implementer.

**Evidence:** Types, unit tests, and lint passed before real builds revealed pure Core facades importing the DB root and client dependencies reaching Core session infrastructure. The client ESLint rule recognizes an initial `use client` directive and enumerated exports; it does not traverse every shared dependency such as `interfaces.ts`.

**Change:** Extend the existing import-safety approach to Backend entries advertised as client-safe. Resolve their real package exports in a fresh process and reject DB implementation, Env, and infrastructure dependencies. Preserve identity checks for reused helpers/schemas. Use deterministic tests for this mechanical contract; retain the emitted-bundle audit for the full graph.

**Completion:** Replacing `@findeg/db/types` with the DB root inside a pure facade, or exporting a session factory from a schema entry, fails a fast test. Valid pure imports and erased types pass. R1 makes these tests part of required verification.

### R3 — P2: preserve useful failure diagnostics before source-map cleanup

**Category:** Information access and tool economy. **Owner:** Build verifier maintainer. **Contributor:** consumer implementer.

**Evidence:** The empty-map failure reported only `Client source map has no module sources`. The wrapper correctly removed maps in `finally`, so identifying the rejected artifact required another raw build. That diagnostic build spent 110 seconds compiling plus 22.6 seconds checking types.

**Change:** Wrap every parser/audit failure with the relative chunk and map identities, map shape, and rejection reason before cleanup. Save bounded metadata as failure evidence where appropriate. Continue removing browser source maps on success and failure.

**Completion:** An unknown empty-map artifact fails with its chunk name and zero source/mapping counts in one run. Deployment output contains no verification maps, and arbitrary unmapped code remains rejected. The known forwarding case is already fixed; diagnostic coverage remains incomplete.

### R4 — P2: enforce route-to-data imports and directive placement mechanically

**Category:** Automated checks and navigation. **Owner:** Frontend lint maintainer. **Contributors:** original Standards review, consumer implementer.

**Evidence:** Three Storefront account routes directly invoked service factories despite [the route README](../../frontend/storefront/src/app/README.md) mandating App Data Layer reads. An import inserted before `use client` also removed a component's explicit boundary. Review caught both; existing lint did not.

**Change:** Scope an existing-linter rule to Storefront route files so service-factory value imports belong in data modules, with types and pure schemas still allowed. Detect a client directive displaced after imports. Keep architectural rationale in the route documentation; add only a conditional navigation pointer if route implementers repeatedly miss it.

**Completion:** Fixtures reproducing the direct route factory imports and misplaced directive fail lint. Data-module composition and valid directives pass. Trusted session identities and private, uncached customer reads remain covered. These are syntactic boundaries, so extra reviewer prose is insufficient.

### R5 — P2: test Orders behavior through the actual Dashboard home route

**Category:** Automated checks. **Owner:** Dashboard acceptance-test maintainer. **Contributor:** Spec reviewer.

**Evidence:** The new API/query functionality existed while the home route omitted it. The widget test added after review checks exact rendering, but it would still pass if the route stopped mounting the widget.

**Change:** Add a home Orders scenario using the existing Cypress fixture mechanism and strict-tier E2E runner. Exercise accepted revenue, seven status entries, a recent reference, and localized detail navigation. Retain the cheap widget test for values beyond safe-number precision.

**Completion:** Removing the Orders section from the real home route fails the scenario. Existing strict CI executes it in both locales. This extends coverage rather than adding another runner.

### R6 — P2: make local verification resource-aware and reproducible

**Category:** Tool economy and test environment. **Owner:** Agent workflow/tooling maintainer. **Contributor:** coordinator.

**Evidence:** Running workspace tests alongside two production builds caused three five-second Storefront timeouts. Another run overlapping a diagnostic build caused a different timeout. Quiet reruns passed all 27 tasks in 33.8 and 41.8 seconds. This supports resource contention as the working explanation; it does not prove the tests can never flake under other conditions. Separately, the statistics implementer reports a multiline shell sequence committing `ca2172064` after ESLint returned errors. Pre-commit formatting did not enforce that lint result. The new untranslated label was subsequently corrected and canonical lint passed.

**Change:** Provide one local verification workflow that serializes resource-heavy phases: workspace checks, production builds, then servers/browser tests. Reuse the CI setup and existing scripts as the source of truth. Record phase logs, immutable HEAD, database identity, readiness results, exit codes, and owned cleanup resources in a compact manifest. Make any mutation workflow stop before commit/merge when required checks fail; add package-aware staged lint to the existing hook where its suppression/config behavior is supported. Allocate an available test port rather than assuming one; the session's initial chosen database port was occupied.

**Completion:** One invocation produces a bounded verification receipt and cleans up only its own processes/database/environment file. Unit tests and builds do not compete on the same machine. An injected lint failure returns nonzero and prevents a following commit step, while retaining the diagnostics. Preserve test budgets and assertions; diagnose repeat failures rather than automatically retrying them into a pass.

### R7 — P2: make aggregation fixture ownership explicit

**Category:** Automated checks and test environment. **Owner:** PostgreSQL test maintainer. **Contributors:** statistics implementer, consumer implementer, coordinator.

**Evidence:** The statistics subset passed, but the full run observed rows created by other files on the same 2026 DST dates. The integration database is fresh per run and files are serialized; neither property removes rows from earlier files. Moving this suite to 2027 fixed the observed collisions but does not establish durable isolation.

**Change:** Make aggregate fixtures' calendar ranges explicit through a small existing-test helper or registry, and detect accidental overlap. Correct the integration-config comment to distinguish lock serialization from row isolation. Select transaction rollback or per-suite isolation only after accounting for cross-domain, concurrency, and multiple-connection tests; blanket truncation would erase relevant fixtures.

**Completion:** Aggregation suites pass individually, together, and with reversed file order while retaining exact totals and literal DST boundaries. A reused reserved range is detected. The full PostgreSQL gate remains required after fixture changes.

### R8 — P2: document net subtotal semantics at the public contract

**Category:** Navigation and automated checks. **Owner:** Orders contract and Dashboard acceptance-test maintainers. **Contributor:** statistics implementer.

**Evidence:** The initial Dashboard fixture treated subtotal as gross. Checkout actually stores the sum of net line totals. This produced a breakdown that did not reconcile for a discounted Order. Commit `e283f55bb` corrected gross display to `subtotal + discountTotal` and the fixture to net 35.00, gross 37.50, discount 2.50, shipping 10.00, and accepted total 45.00. The public `Order.subtotal` field still has no adjacent explanation of its meaning.

**Change:** Define net semantics beside the public type and extend existing visible Order coverage with a discounted snapshot produced through Acceptance. Keep the current small UI regression, but derive at least one cross-boundary test's snapshot from its real producer rather than a consumer-authored assumption.

**Completion:** A consumer can learn the field's meaning from the public contract without searching Checkout internals. Rendering net subtotal as gross fails both the cheap worked-example test and the accepted-Order visible workflow. The observed UI defect is already fixed; documentation and producer-derived coverage remain.

### R9 — P2: keep application test aliases aligned with TypeScript

**Category:** Automated checks. **Owner:** Dashboard test configuration maintainer. **Contributor:** statistics implementer.

**Evidence:** Dashboard TypeScript declared `@data/*`, but Vitest omitted it. Migrated data-layer callers type-checked while four test suites failed import analysis. Adding `@data` fixed the observed failure; [Vitest configuration](../../frontend/dashboard/vitest.config.ts) still manually duplicates only part of the application alias table.

**Change:** Derive application-local test aliases from tsconfig or add a deterministic parity test. Keep workspace package imports, especially Orders, on their actual public export-resolution path. Do not convert package internals to test-only aliases.

**Completion:** A new application alias requires one configuration edit and resolves in both TypeScript and Vitest. Invalid Orders subpaths remain rejected. This removes configuration drift rather than adding reviewer guidance.

### R10 — P3: resolve contradictory Backend navigation material

**Category:** Navigation and automated checks. **Owner:** Backend documentation maintainer. **Contributor:** final Standards reviewer.

**Evidence:** [Backend README](../../backend/README.md) contains literal merge-conflict markers, outdated package commands, and conflicting error-contract examples. These predate the reviewed changes. They can misdirect future implementation/review even though authoritative ADRs were sufficient in this session.

**Change:** Resolve the README conflicts and use pointers to current ADRs/package contracts instead of duplicating stale conventions. Add a deterministic tracked-file conflict-marker check with intentional-example handling. Resolve the judgement about the current error convention once in its owning documentation.

**Completion:** Backend README states one current contract and has no conflict markers; an accidental marker fails the check. Do not copy this reference material into AGENTS.md.

### R11 — P3: sharpen Spec review completion and bound merge receipts

**Category:** Review procedure and tool economy. **Owners:** Review/implementation skill maintainers. **Contributors:** Spec reviewer, merger.

**Evidence:** The missing home behavior lived in an unchanged route, so reading exported functions or the diff alone was insufficient. One broad reviewer diff exceeded 17,000 tokens and truncated. The merger repeated branch/status/SHA/merge/whitespace commands across seven successful merges; large file statistics added little decision value.

**Change:** In the Spec review skill, require the reviewer to account for each user-visible requirement through its actual route/control and public-module call path, including unchanged files. Discover paths once and read diffs by requirement. Optionally provide a merger helper taking the integration branch and immutable target SHA, verifying cleanliness/ancestry, and issuing a compact old/new SHA receipt after `--ff-only --no-stat`.

**Completion:** Review evidence names the real entry point for each requested flow without truncated substantive reads. The merger rejects wrong branches, dirty state, and non-descendant commits before mutation, and merges the requested SHA even if a branch advances. This is a refinement of working processes; no merge failure occurred.

## What to preserve

- Public API/PostgreSQL TDD seams exposed exact statistics and lifecycle behavior without testing private implementation structure.
- Independent Standards and Spec reviews found different defects. Targeted rechecks kept late fixes reviewable without repeating the entire review.
- Actual production graph audits caught transitive dependencies that type checks and focused unit tests could not detect.
- Existing adversarial Cypress cases proved stale-transition reload behavior; preserve them alongside authorization and request-failure scenarios.
- Managed worktrees, immutable commit pointers, and fast-forward integration kept ownership clear. Both child worktrees were archived after completion.
- The generated-map exception stayed narrow, with tests rejecting arbitrary inserted code. The verifier should continue failing closed on unknown artifacts.

## Suggested order

1. Wire the existing architecture suite (R1).
2. Add fast boundary checks and useful build diagnostics (R2–R4).
3. Close route acceptance coverage, local verification/fixture gaps, and public/test contract drift (R5–R9).
4. Clean reference docs and refine review/merge ergonomics (R10–R11).

No additional permission workflow, wholesale alias migration, duplicate CI pipeline, increased test timeout, or broad global steering rewrite is supported by this session.

## Subagent contribution record

Every original role was prompted to apply the same retro skill. Five agents returned direct retrospectives. Restarting the original Standards reviewer failed with `agent thread limit reached`; the final Standards reviewer reconstructed that role from its saved primary messages/session record using the same skill. This is explicitly a reconstruction, not testimony returned by the original agent.

| Agent | Role and report status | Contributions to the report |
| --- | --- | --- |
| `/root/implement_367` | Statistics/Dashboard implementer; direct retrospective | R6 local lint/mutation gate, R8 net/gross contract, R9 aliases; optional worktree bootstrap and immutable snapshot fixture navigation |
| `/root/explore_368` | Explorer, consumer implementer, final-fix owner; direct retrospective | R1 architecture wiring, R2 pure entries, R3 diagnostics, R4 route/directive lint, R7 fixture ranges |
| `/root/merger` | Integration merger; direct retrospective | R1 architecture wiring, R11 bounded merge helper; all seven merges succeeded |
| `/root/review_spec` | Independent Spec reviewer; direct retrospective | R5 real home-route coverage, R11 requirement tracing and bounded diff reads |
| `/root/review_standards` | Original independent Standards reviewer; reconstructed retrospective | R4 deterministic route imports and misplaced directives; original messages confirm both fixes and a clean recheck |
| `/root/review_final_standards` | Late independent Standards reviewer; direct retrospective and explicit original-role reconstruction | R1 architecture wiring, R10 conflicted/stale docs; confirmed narrow final fixes |

The coordinator contributes the cross-role evidence synthesis, verification contention analysis, isolated-environment orchestration, and classification of remaining versus fixed work. Duplicate recommendations were merged; priority is a synthesis of future impact, not a vote count or copied agent severity.

Two additional lower-priority suggestions from the statistics implementer are recorded without expanding the main action list:

- **Worktree bootstrap:** The assigned managed path initially fell outside the child's writable roots and dependency installation returned EPERM. Before dispatch, the orchestrator should verify integration ancestry, path writability, dependency installation, and isolated DB access. Platform-scoped grants belong in orchestration, not repository permission bypasses. Success means normal install/edit operations work in the assigned checkout without repeated escalations. Approved escalation allowed this session to proceed.
- **Immutable fixture navigation:** A first statistics coherence fixture attempted to mutate frozen snapshot money; the existing PostgreSQL trigger correctly rejected it. A narrow atomic snapshot fixture helper and testing pointer could reduce this friction while preserving freeze-trigger coverage. This is optional reuse of an effective guardrail, not a missing production invariant.

Local role reports were read from `/private/tmp/findeg-361-retro-{stats,consumers,merger,spec-review,standards-review,final-standards}.md`. Original Standards messages were extracted to `/private/tmp/findeg-361-original-standards-messages.md`. Material findings and contribution limits are retained here so these temporary files are not required to use the report.

## Sources and limits

Primary evidence includes the current-session transcript, implementation commits, direct reviewer messages, role retrospectives, actual repository scripts/hooks/workflows, and verification logs. The coordinator checked the integration branch before repository reads and did not run new application tests for this documentation task.

Durable sources: implementation history through `f2e33a791`, [PR #379](https://github.com/3mrhussein/findeg/pull/379), [CI policy](../../.github/scripts/ci-policy.mjs), [CI jobs](../../.github/workflows/ci-jobs.yml), [integration configuration](../../backend/vitest.integration.config.ts), [client import rule](../../packages/config/eslint/rules/no-full-barrel-import-in-client-components.js), [architecture tests](../../scripts/architecture), and the linked app/agent documentation.

Local evidence was inspected under `/private/tmp/findeg-361-*`: workspace `final3`/`final5` failures and `final4`/`final6` passes; integration `final` failures and `final2` pass; Dashboard build failures and `final5` pass; Storefront `final4` pass; Cypress `final` 14/18 and `final2` 18/18; raw empty-map build and architecture results. These temporary logs are session evidence, not a durable repository artifact contract. This report records their material findings without copying source maps, credentials, or session cookies.
