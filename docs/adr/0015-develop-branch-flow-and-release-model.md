---
status: accepted
---

# Develop-branch flow, tiered CI and automated releases

Every PR used to go straight to `main` behind CI that had grown piecemeal: two overlapping workflows, caches that mostly never hit, required checks tied to job names, and no releases at all. The owner wants feature work to merge fast while `main` only takes release-grade, fully verified code, and wants each release versioned, changelogged and tagged without manual steps. Decided in [#312](https://github.com/3mrhussein/findeg/issues/312). Amends ADR-0002 (branch naming, done in its own amendment).

## Decisions

### Branches

- **`develop` is the default branch and holds the next release's feature set.** Feature PRs target it. Each `develop → main` merge ships that set.
- **`main` takes only `develop`, `hotfix/*` and `release-please--*` PRs.** `Branch policy` rejects every other source (ADR-0002). A `hotfix/<slug>` PR goes straight into `main` and reaches `develop` through the post-release sync PR, never by hand.
- **The old `develop` is preserved, not merged.** It was reset to `main` at launch. Its 69 commits not on `main` stay on `chore/archive-develop-2026-09-15` (`501ee3b1`), which a ruleset protects from deletion and force-push.

### Two CI tiers, chosen by the target branch

- **Fast tier (PRs into and pushes to `develop`):** lint, type check, unit tests and build, run by Turbo on affected packages only, with caches restored. Integration tests run only when the backend, db, env package, lockfile, root tooling or the CI policy changed. Non-code changes (docs, `.github/`, agent tooling) skip the code checks. No E2E.
- **Strict tier (PRs into and pushes to `main`):** every job from scratch: Turbo `--force`, a shallow clone, no cache restore or save, integration tests always, plus E2E. A strict run whose E2E was skipped instead of passed fails its gate, so a wrong condition can't let unverified code into `main`.
- **Every tier and gating decision lives in one tested module, `scripts/ci-policy/policy.mjs`.** The workflow YAML only passes its outputs on.

### Two workflows, one job definition, one gate each

- **`CI · Feature` (fast, `develop`) and `CI · Release` (strict, `main`) hold only their triggers.** Both call the reusable `CI jobs` workflow from a caller job named `Feature` or `Strict`, so every job is defined once and the strict run is the same steps, stricter.
- **Each run feeds one aggregate `CI OK` job, reported as `Feature / CI OK` or `Strict / CI OK`.** These are the only code checks the rulesets require. Adding, splitting, renaming or skipping a job never touches a ruleset, and docs-only PRs pass because skipped jobs count as passing.
- **A tier guard fails `Plan` when a workflow's triggers would run the other tier**, so a mis-set trigger can't run fast CI on a PR into `main`.
- **`PR conventions`** runs `PR title` and `Branch policy` on every PR, whatever its base.

### Cache policy

- **Pushes to `develop` are the single cache producer.** Pull requests only restore. GitHub lets a PR restore caches saved on its base branch, but a cache saved by a PR is visible only to that PR, so PR saves would only fill the 10 GB quota.
- **The strict tier neither restores nor saves**, so what ships to `main` is built and verified from nothing.
- **Restore and save are separate steps** (`.github/actions/setup` and `.github/actions/save-cache`). setup-node's built-in cache is off because its post step always saves.
- **Keys:** the pnpm store is keyed by the lockfile and saved once per run. Each job's Turbo cache is keyed per commit, restored by prefix, and pruned of entries older than a week before saving. The Next.js build cache is keyed by the lockfile and sources.

### Rulesets and merge methods

- **`main`:** requires `Strict / CI OK`, `PR title` and `Branch policy` (GitHub Actions source), up to date before merging, resolved conversations, **merge commits only**, blocks force-push and deletion, and has no bypass actors.
- **`develop`:** requires `Feature / CI OK`, `PR title` and `Branch policy`, not up to date (feature PRs merge without rebasing on each other), resolved conversations, squash and merge commits allowed, blocks force-push and deletion, and has no bypass actors.
- **Feature PRs into `develop` are squashed, and the squash commit's title is always the PR title.** The title `PR title` validated is what lands, and it is what release-please reads.
- **`develop → main`, hotfix, release and sync PRs use merge commits.** This is load-bearing. A squash would hide the per-feature Conventional Commits from release-please. It would also put a commit on `main` that `develop` never has, so the branches would diverge on every release.

### Release model

- **release-please runs on every push to `main`** in manifest mode, with one root component: one version for the whole repo, meaning the storefront, dashboard and backend that shipped together.
- **A Release PR accumulates the next version and changelog** from Conventional Commits and auto-merges once its checks pass. Merging it creates the `vX.Y.Z` tag and a GitHub Release whose notes are that version's changelog section. Merging `develop → main` is the only manual step in a release.
- **The release is then synced back:** an automatic `main → develop` PR, merged with a merge commit, brings the version bump and changelog into `develop`.
- **Versions stay on 0.x until 1.0.0 is cut by hand at production launch.** While on 0.x, `feat` and breaking changes bump the minor version and `fix` bumps the patch.
- **The changelog has Added, Fixed, Changed, Reverted and Breaking sections.** docs, style, test, build, ci and chore commits are left out, and the hand-written history stays below the generated entries.
- **A dedicated release-bot GitHub App opens the Release and sync PRs**, so they trigger CI like any other PR, and the rulesets keep zero bypass actors. Only the bot can create `v*` tags, and no one can update or delete them.

### Dependency updates

- **Dependabot checks GitHub Actions and npm weekly, targeting `develop`.** `.github/dependabot.yml` covers Actions and the root pnpm workspace with its shared lockfile.
- **npm patch and minor updates share one group; major updates arrive as individual PRs.** Production and development dependencies use the same `chore(deps)` prefix; Actions use `ci(deps)`. These Conventional Commit types pass `PR title` and stay out of the release changelog.
- **Dependabot PRs follow the ordinary fast-tier checks.** The existing `dependabot/*` exemption passes `Branch policy`; dependency changes run the code checks. After the config lands on `develop`, verify the first bot PR passes `PR title`, `Branch policy` and `Fast / CI OK` before considering the live acceptance check complete.

## Considered options

- **Keep every PR on `main`, with one CI tier.** Rejected: features would wait on release-grade validation (E2E, no caches), or releases would ship with fast-tier checks only.
- **One CI workflow that switches tier by base branch.** Rejected: the release path would be indistinguishable in the Actions tab, and one check name would serve both branches. Separate workflows and gate names mean a fast result can never satisfy `main`.
- **Require each job by name.** Rejected: every rename or split meant a ruleset edit, and docs-only PRs blocked on checks that never report.
- **Squash `develop → main`.** Rejected for the release-please and divergence reasons above.
- **Let PRs save caches too.** Rejected: PR-scoped caches can't be read by other PRs, so they only fill the quota.
- **Cache on the strict tier.** Rejected: a release should be verified from nothing.

## Consequences

- **A release can't merge until E2E is green.** The Cypress suite has never run in CI, so specs that fail are fixed or quarantined before the first `develop → main` release.
- **Feature branches can't reach `main`.** A PR from one fails `Branch policy`; retarget it to `develop`.
- **The first push to `develop` after a cache-key change runs cold**, and PRs opened before it finishes restore nothing.
- **Adding a CI job means adding it to `CI jobs` and to `CI OK`'s `needs`.** No ruleset change is needed.
