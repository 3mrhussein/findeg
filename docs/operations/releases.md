# Automated releases

The branching and release decisions are recorded in [ADR-0015](../adr/0015-develop-branch-flow-and-release-model.md).
Implementation: [#322](https://github.com/3mrhussein/findeg/issues/322). Live first-release acceptance: [#323](https://github.com/3mrhussein/findeg/issues/323).

## Normal flow

1. Merge `develop` into `main` with a merge commit after `Strict / CI OK`, `PR title` and `Branch policy` pass. The strict tier is shared by every PR into `main`, including Release PRs, and always requires E2E success.
2. `Release` runs on the push to `main`. It mints a repository-scoped installation token from `RELEASE_APP_ID` and `RELEASE_APP_PRIVATE_KEY`, then runs release-please in manifest mode against `main` (the repository default is `develop`). The token is revoked at job completion. It must have contents and pull requests write; PR labels use pull requests permission.
3. release-please creates or updates its Release PR. The workflow enables auto-merge with a **merge commit**. Required checks and conversations still gate the merge; the bot has no ruleset bypass. `always-update` refreshes the Release PR even for hidden commit types, keeping it current with the strict up-to-date rule.
4. The resulting push to `main` publishes the `vX.Y.Z` tag and GitHub Release. Only the release App can create `v*` tags; updates and deletions remain blocked.
5. The same run creates or updates a `main → develop` sync PR with a `chore:` title and enables merge-commit auto-merge. Using `main` as the head carries released history and hotfixes without rewriting branches. An existing open sync PR receives new commits when `main` advances. It runs the fast checks required on `develop`.

App-authenticated PR creation and updates trigger CI. The workflow's built-in `GITHUB_TOKEN` has only contents read. Release runs share a concurrency group and do not cancel an in-progress release.

## Version and changelog

The root `package.json` and `.release-please-manifest.json` start at `0.1.0`. There is one root `node` component and no workspace plugin: workspace package versions are not independently released. Tags have a `v` prefix and no component prefix.

On 0.x, `feat` and breaking changes bump the minor; `fix` bumps the patch. No `release-as` override pins later releases. Production launch can explicitly request 1.0.0 in its release ticket.

`release-please-config.json` maps `feat` to Added, `fix` to Fixed, `perf` and `refactor` to Changed, and `revert` to Reverted. Breaking changes appear in release-please's highlighted BREAKING CHANGES section, including breaking commits of otherwise hidden types. Ordinary docs/style/test/build/ci/chore commits are hidden.

release-please prepends generated version entries to `CHANGELOG.md`; the existing dated history remains below them. No bootstrap cutoff excludes earlier commits from the initial release. The commit search depth is explicitly 1,000, covering the initial history of more than 500 commits that exceeds release-please's default search limit. The old generator has been removed; future entries come from Conventional Commits.

## First-release verification (#323)

Local validation for #322 (2026-10-06): actionlint and shell syntax checks passed. An isolated fixture run using release-please 17.6.0 (the version bundled by action v5.0.0) validated the configuration schema, a feature bump to `0.2.0`, a fix bump to `0.1.1`, breaking feature and hidden-type CI bumps to `0.2.0`, visible and hidden changelog sections, root package updates, Conventional Commit PR titles, release branch naming and preservation of the existing historical changelog. Docs/CI-only fixtures produced no Release PR. No live PR, tag or release was created by these fixtures.

Local configuration checks do not certify GitHub rulesets, App permissions, workflow events or auto-merge. Record these live results in #323 and the parent #312 when the first release runs; they are pending until then:

- Link the `develop → main` PR and strict CI run. Confirm fresh builds, E2E executed and green, and a merge commit.
- Link the bot-authored Release PR and its strict CI / conventions runs. Confirm its root version and manifest become `0.2.0`, its generated sections precede the historical changelog, and auto-merge uses a merge commit.
- Link the `Release` workflow run, immutable `v0.2.0` tag and published GitHub Release; confirm the notes match that version's changelog section.
- Link the bot-authored `main → develop` sync PR and fast CI / conventions runs. Confirm merge-commit auto-merge and no content diff between `main` and `develop` afterwards.
- Confirm a feature branch PR into `main` fails `Branch policy`.

## Spec and ticket coverage (2026-10-06)

This implementation covers the strict-workflow amendment in [#312](https://github.com/3mrhussein/findeg/issues/312#issuecomment-5999884779): `CI` targets `develop`, `CI · Release` targets `main`, both call `CI jobs`, and the tier guard rejects a caller mismatch. Retargeting a PR triggers the newly selected tier. The gate rejects an absent or skipped plan, an unknown tier, failed or cancelled jobs, and strict E2E without success.

| Ticket | Delivered code or verified repository state                                                                                                                                                                                                                                                                                          | Remaining live evidence                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| #313   | Archive still points at `501ee3b1`, protected against deletion and force-push; squash title is `PR_TITLE`; merge commits are enabled.                                                                                                                                                                                                | None.                                                                                                       |
| #314   | Release App `5201819`, secrets and token-mint check are recorded in the ticket. The `v*` creation rule permits only the App; a separate immutable-tag rule has no bypass actors.                                                                                                                                                     | Actual publication is covered by #323.                                                                      |
| #315   | Shared branch policy and pre-push validator, `PR conventions`, ADR-0002 and agent branch instructions are delivered.                                                                                                                                                                                                                 | Rejection of a feature source into `main` is included in #323 acceptance.                                   |
| #316   | Parallel reusable jobs, shared setup, cache producer policy, Turbo inputs and affected filtering, health-checked Postgres, Node and Actions upgrades are delivered. Policy tests pass; consolidated PR #341 passed its initial fast CI run.                                                                                          | Fresh strict validation is covered by #323.                                                                 |
| #317   | `main` requires `Strict / CI OK`, `PR title` and `Branch policy`, with up-to-date and conversation rules, no force-push or deletion, and no bypass actors. Ticket records green verification PRs #326 and #327.                                                                                                                      | None.                                                                                                       |
| #318   | Old duplicate workflows and backend version warning are removed; bot workflows are purpose-named and Claude review remains advisory. The remaining bot checkout uses v7.                                                                                                                                                             | None.                                                                                                       |
| #319   | Default branch is `develop`; its ruleset requires the fast gate and conventions, permits squash and merge commits, is not up-to-date-strict, and has no bypass actors. `main` permits merge commits only. ADR-0015 records the decisions.                                                                                            | None.                                                                                                       |
| #320   | Strict CI includes migrated and seeded Cypress E2E, explicit binary installation without cache restore, failure artifacts and a gate requiring E2E success.                                                                                                                                                                          | Both suites must pass on the first strict release run; deferred journeys are tracked in #342–#347.          |
| #321   | Weekly Actions and grouped npm patch/minor updates target `develop`; majors remain separate. Dependabot PR #336 passed fast CI and both conventions checks.                                                                                                                                                                          | None.                                                                                                       |
| #322   | App-authenticated release-please, one root manifest component, pre-major versioning, generated changelog, Release PR auto-merge and merge-commit sync PR are delivered. A no-tag Manifest fixture using all 508 historical commits produced `0.2.0`, updated root and manifest versions, and preserved historical changelog entries. | Live App-authored Release and sync PRs, auto-merges, immutable tag and published notes are covered by #323. |
| #323   | First-release verification checklist above is ready. No publication was triggered during implementation.                                                                                                                                                                                                                             | Owner-approved `develop → main` release, strict E2E success, `v0.2.0` and completed sync remain pending.    |
| #324   | Separate caller workflows report `Fast / CI OK` and `Strict / CI OK`; jobs are defined once and policy tests cover matching and mismatched tiers.                                                                                                                                                                                    | Strict release observation is included in #323.                                                             |

The external behavior checks use the CI policy unit seam and isolated release-please fixtures. Repository settings were inspected read-only. Passing fast CI does not certify the first release, so #323 and the parent spec remain open until the pending release evidence is recorded.

## Recovery

A failed token mint requires checking the installed release App and the two existing secrets. A failed PR or tag operation requires checking its permissions and rulesets. Keep bypasses disabled.

If publication succeeded but sync failed, rerunning release-please may no longer report a newly created release. Recover the sync by opening or updating the `main → develop` PR with a conventional `chore:` title and enabling merge-commit auto-merge. Do not reset either branch or recreate a published tag. A conflicted sync PR needs a deliberate merge-conflict resolution before its checks and auto-merge can complete.
