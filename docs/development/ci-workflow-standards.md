# CI Workflow Standards

Conventions for structuring and naming GitHub Actions in this repo. They are written to be copied to any other repo: the rules are generic, and the last section maps them to this repo's files. Decisions specific to Findeg (tiers, branches, releases) live in [ADR-0015](../adr/0015-develop-branch-flow-and-release-model.md).

## 1. Layout

| Path                           | Holds                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `.github/workflows/`           | One file per trigger family. Triggers and permissions only; no decisions                                   |
| `.github/workflows/*-jobs.yml` | The reusable job definitions (`workflow_call`), written once and called by the trigger files               |
| `.github/actions/<name>/`      | Composite actions for repeated step sequences (setup, save-cache)                                          |
| `.github/scripts/`             | Pure decision logic and CLIs the workflows call (`*-policy`, `*-cli`, `*-config`), each with a `.test.mjs` |
| `.github/config/` (optional)   | Data the scripts read: tables of patterns, version lists, scopes. Use JSON, one concern per file           |
| `docs/development/`            | This file. Per-repo decisions go in `docs/adr/`                                                            |

Rule: **the YAML wires, the scripts decide.** Any branching on branch names, paths, tiers or job results lives in a script with tests, never in `if:` expressions spread across jobs.

## 2. Naming

- **Workflow `name:`** is a short noun phrase in Title Case that says what it guards or does: `CI · Feature`, `CI · Release`, `Release`, `PR conventions`, `Bots`. Reusable files are named for what they hold (`CI jobs`). Scheduled or housekeeping workflows say so: `Nightly security scan`, `Cleanup caches by a branch`.
- **Files** are kebab-case and match the name: `ci.yml`, `ci-release.yml`, `ci-jobs.yml`, `pr-conventions.yml`.
- **Caller job ids** are the tier or purpose (`feature`, `strict`) with a Title Case `name:` (`Feature`, `Strict`).
- **The gate job** is always `ci-ok`, named `CI OK`. Its check context is `<caller job> / CI OK` (`Feature / CI OK`, `Strict / CI OK`). Rulesets require only gates, never individual jobs.
- **Job ids** are lowercase, one word where possible (`plan`, `checks`, `build`, `integration`, `e2e`). The first job of a pipeline is `plan` and produces every output the others read.
- **Inputs and outputs** use `snake_case`. Outputs are named after the decision (`restore_deps`, `run_e2e`), not the implementation.
- **Env vars** in `UPPER_SNAKE`. Repeated ones go in the workflow-level `env:`.
- **Dispatch input labels** read as a sentence a person would click, with the effect in parentheses: `Force disable cache (fresh build)` (`no_cache`), `Run the full suite, E2E included (default runs touched packages only)` (`full_tests`). Both default to unchecked, and a manual run otherwise tests touched packages only with caches restored. The reusable workflow takes the same input ids, so the caller passes them straight through.

## 3. Triggers and runs

- **Every pipeline workflow has `workflow_dispatch`.** Inputs are booleans, `default: false`. Anything that makes a run slower or colder than normal is opt-in by checkbox, never the default.
- **PRs run automatically.** Include `edited` in `pull_request` types when the base branch picks the tier, so retargeting reruns CI.
- **Concurrency** is set only by the caller: `group: <workflow>-<pr number or ref>`, `cancel-in-progress: true` for PRs and `false` for pushes, so every merged commit gets a verdict.
- **Permissions** default to `contents: read` at the top of the file; jobs ask for more only where needed. Every caller of a reusable workflow must grant at least the highest permission any nested job asks for, even if that job never runs for that caller, or GitHub rejects the caller file.
- **A tier guard** (`expect-tier` in the plan) makes a mis-set trigger fail `plan` instead of silently running the wrong pipeline.

## 4. Tiers and caches

- A repo has two tiers: **fast** (affected packages, caches restored) for feature PRs and for pre-production pushes that merge one, **strict** (everything, forced, nothing restored, E2E required) for the release path and for pre-production pushes that bring a hotfix (a direct push, or a merge from the release branch or `hotfix/*`). A manual run with `full_tests` runs every package plus E2E.
- **One cache producer branch**, saving after a from-scratch run. Everything else only restores. Restore and save are separate steps; restore is split into dependency store and build caches so either can be bypassed.
- **Cache keys** that are content-hashed are immutable. A forced run on the producer branch deletes the matching caches before saving, so the save takes effect.
- **A cleanup workflow** removes a PR's caches when it closes (`Cleanup caches by a branch`, trigger `pull_request: closed`, per-PR concurrency, `cancel-in-progress: false`). Needed only when PRs are allowed to save caches.

## 5. Skips and safety

- The first job guards against loops: skip runs for bot commits tagged `[release]` or `[ci skip]` where a bot pushes to a watched branch. The gate still reports, so required checks don't hang.
- Skipped jobs count as passing in the gate; a **strict** gate additionally fails if E2E was skipped.
- Workflows that need no secrets are passed none.

## 6. Reporting: templates, themes and tokens

Every report a pipeline produces (job summary, chat card, PR comment) is **a template filled with values**. Repos change the data, never the renderer, so the same files work in any repo.

**Files** (all under `.github/config/`, plain JSON or Markdown, one concern each):

| File                              | Holds                                                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `themes.json`                     | One entry per status: `emoji`, `color` (hex, no `#`), `label`. The only place colors and emojis live            |
| `templates/<name>.md`             | Job-summary templates in GitHub-flavoured Markdown                                                              |
| `templates/<name>.<channel>.json` | Chat card templates, one file per report and channel (`.slack.json` first)                                      |
| `settings.json`                   | Global switches: `max_log_lines` (50), `collapse_logs`, `enable_error_analysis`, which templates run on failure |

**Statuses** are a closed set shared by every template: `success`, `failure`, `warning`, `skipped`, `running`, `info`. A template never picks a color or emoji itself; it asks for the status token and the theme resolves it.

```json
{
  "success": { "emoji": "✅", "color": "2EA44F", "label": "Succeeded" },
  "failure": { "emoji": "❌", "color": "CF222E", "label": "Failed" },
  "warning": { "emoji": "⚠️", "color": "BF8700", "label": "Warning" },
  "skipped": { "emoji": "⏭️", "color": "6E7781", "label": "Skipped" }
}
```

**Tokens** are `%UPPER_SNAKE%` placeholders. A fixed core set is available everywhere, so templates stay portable:

`%STATUS%` `%STATUS_EMOJI%` `%THEME_COLOR%` `%STATUS_LABEL%` `%REPO_NAME%` `%WORKFLOW%` `%JOB%` `%BRANCH%` `%SHA%` `%ACTOR%` `%TIME%` (UTC) `%DURATION%` `%RUN_URL%` `%CHANGELOG_SNIPPET%` `%CHANGELOG_URL%`

Anything else is a report-specific token (`%FAILED_SPECS%`, `%CACHE_KEY%`) supplied by the script that renders it. An unknown token fails the render rather than printing `%X%`.

Example card template (Slack incoming webhook, tokens only, no hard-coded host or repo). The attachment `color` draws the status bar; the webhook URL is a secret, never in the template:

```json
{
  "attachments": [
    {
      "color": "#%THEME_COLOR%",
      "fallback": "%STATUS_EMOJI% %WORKFLOW% %STATUS_LABEL% for %REPO_NAME%",
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "%STATUS_EMOJI% %WORKFLOW% %STATUS_LABEL%",
            "emoji": true
          }
        },
        {
          "type": "section",
          "fields": [
            { "type": "mrkdwn", "text": "*Repo*\n%REPO_NAME%" },
            { "type": "mrkdwn", "text": "*Branch*\n%BRANCH%" },
            { "type": "mrkdwn", "text": "*Actor*\n%ACTOR%" },
            { "type": "mrkdwn", "text": "*Time (UTC)*\n%TIME%" }
          ]
        },
        { "type": "section", "text": { "type": "mrkdwn", "text": "%CHANGELOG_SNIPPET%" } },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": { "type": "plain_text", "text": "View run" },
              "url": "%RUN_URL%"
            },
            {
              "type": "button",
              "text": { "type": "plain_text", "text": "View changelog" },
              "url": "%CHANGELOG_URL%"
            }
          ]
        }
      ]
    }
  ]
}
```

Other channels (Teams `MessageCard`, email) are added as further `<name>.<channel>.json` templates; the tokens and themes do not change.

**Rules**

- **One renderer, in `.github/scripts/`,** pure: `(template, theme, tokens) → string`. It has tests (token substitution, unknown token fails, every status has a theme, every template's tokens are known). Workflow steps only pass values in and write the result to `GITHUB_STEP_SUMMARY` or post it.
- **Hosts, webhooks and URLs are tokens or secrets,** never in a template, so the same template ships to every repo.
- **A template names the report, not the job:** `plan`, `checks`, `e2e`, `cache`, `release`, `deployment`. A workflow picks the templates it needs; no file maps workflows to jobs to steps.
- **Fixed field order per template,** so reports look the same across repos.
- **Failure reports always render,** even when the step crashed early; they say what is missing (for example "no artifacts found") instead of omitting the section.
- **Known-failure hints** (cause and fix) are a table in `.github/config/error-hints.json`, keyed by a regex, limited to failures the repo has actually hit.

## 7. Adopting this in another repo

1. Create the layout in section 1; add `ci-policy`, `ci-cli`, `ci-config` and the test file.
2. Name workflows, jobs and the `CI OK` gate per section 2; require only the gate in rulesets.
3. Add `workflow_dispatch` with `no_cache` and `full_tests` to the feature workflow.
4. Set the tiers and the producer branch in config; write the first ADR for repo-specific choices.
5. Copy `.github/config/` (themes, templates, settings) and the renderer, then add the reports the repo needs.

## 8. This repo today

| Standard                    | Here                                                         | Status                               |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| Feature workflow            | `ci.yml`, `CI · Feature`, gate `Feature / CI OK`             | Done                                 |
| Release workflow            | `ci-release.yml`, `CI · Release`, gate `Strict / CI OK`      | Done                                 |
| Reusable jobs               | `ci-jobs.yml`, `CI jobs`                                     | Done                                 |
| Policy, CLI, config, tests  | `.github/scripts/ci-*.mjs`, `ci-policy.test.mjs`             | Done                                 |
| Dispatch checkboxes         | `no_cache`, `full_tests` on `CI · Feature`                   | Done                                 |
| PR hygiene                  | `pr-conventions.yml`, `PR conventions`                       | Done                                 |
| Loop guard on bot commits   | none                                                         | Open: release-please pushes          |
| Cache cleanup               | none                                                         | Deferred: PRs never save caches      |
| Forced-run cache delete     | none                                                         | Open                                 |
| Themes, templates, renderer | `.github/config/`, `ci-report.mjs`, `ci-e2e-report.mjs`      | Done                                 |
| Plan and E2E job summaries  | `ci-cli.mjs plan`, `ci-e2e-cli.mjs report`                   | Done                                 |
| Slack run-result card       | `Notify` job, secret `SLACK_WEBHOOK_URL` (optional)          | Done; needs the owner's webhook      |
| E2E screenshots             | link mode (default); `pages` mode publishes to `ci-evidence` | Link mode is the fallback; see below |
| Config JSON directory       | none (config lives in `ci-config.mjs`)                       | Not needed until data tables         |
| Nightly security scan       | none                                                         | Out of scope                         |

### Screenshot modes (verified state)

`link` is the default: the summary lists the (up to 3) screenshots and links the run's artifact list, where the full `e2e-failure-evidence` artifact holds them. Per-file, non-zipped artifact uploads (individually viewable links) were **not** verified against the pinned upload action in the implementing session, since that needs a real run; if a run shows it works, point `screenshotUrlFor` in `ci-e2e-cli.mjs` at the per-file artifact links. `pages` mode (set `screenshot_mode` to `pages` in `.github/config/settings.json`, enable Pages on the `ci-evidence` branch) publishes screenshots from a separate `Publish evidence` job with `contents: write`, prunes run folders past `evidence_retention_days`, and lets you uncomment the inline-image block in `templates/e2e.md`. The repo is public, so published screenshots are world-readable. Neither the `pages` publish step nor the Slack post has run against GitHub or Slack yet.
