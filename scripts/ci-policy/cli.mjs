#!/usr/bin/env node
// Thin CLI over policy.mjs, the entry point for workflows.
// All decisions live in policy.mjs; this file only parses arguments and reports.
//
//   node scripts/ci-policy/cli.mjs branch-policy --head <branch> [--base <branch>]
//   node scripts/ci-policy/cli.mjs plan --event <pull_request|push> --target <branch> --expect-tier <fast|strict> [--changed-files <file>]
//   node scripts/ci-policy/cli.mjs verdict --needs <json> [--tier <fast|strict>]
//
// branch-policy: omit --base when the PR's target branch isn't known (e.g. the
//   pre-push hook).
// plan: --expect-tier is the tier the calling workflow runs; the plan exits
//   non-zero, writing no outputs, when the target gets a different tier.
//   --changed-files is a file with one repo-relative path per line; omit it
//   when the changes can't be determined, and every job runs. The decisions are
//   printed and, inside GitHub Actions, written to $GITHUB_OUTPUT as
//   tier, turbo_flags, fetch_depth, use_cache, save_cache, run_checks and
//   run_integration and run_e2e.
// verdict: --needs is the CI OK job's `toJSON(needs)`; exits non-zero when CI
//   OK must fail.
import { appendFileSync, readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { decideBranchName, decidePlan, decideReleaseSource, decideVerdict } from './policy.mjs';

function report(title, { ok, reason }) {
  if (ok) {
    console.log(`✔ ${title}: ${reason}`);
  } else if (process.env.GITHUB_ACTIONS === 'true') {
    console.log(`::error title=${title}::${reason}`);
  } else {
    console.error(`✖ ${title}: ${reason}`);
  }
}

// Runs the branch-name and release-source rules and prints each verdict.
// Returns true when both pass. Inside GitHub Actions, failures are emitted as
// error annotations so they show on the PR's checks page.
function checkBranchPolicy({ head, base }) {
  const checks = [
    ['Branch name', decideBranchName({ head, base })],
    ['Release source', decideReleaseSource({ head, base })],
  ];
  for (const [title, decision] of checks) report(title, decision);
  return checks.every(([, decision]) => decision.ok);
}

function readChangedPaths(file) {
  if (!file) return undefined;
  return readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Report the CI plan and append its outputs when GITHUB_OUTPUT is set.
 * `changedFiles` names a file of newline-separated repository-relative paths; omitting it
 * treats the changed paths as unknown. Returns 0 on success or 1 for a tier guard failure,
 * which writes no plan outputs. File read and append errors propagate to the caller.
 */
function plan({ event, target, expectedTier, changedFiles }) {
  const changedPaths = readChangedPaths(changedFiles);
  const decision = decidePlan({ event, target, expectedTier, changedPaths });
  report('Tier', decision);
  if (!decision.ok) return 1;
  const outputs = {
    tier: decision.tier,
    turbo_flags: decision.turboFlags,
    fetch_depth: decision.fetchDepth,
    use_cache: decision.useCache,
    save_cache: decision.saveCache,
    run_checks: decision.runChecks,
    run_integration: decision.runIntegration,
    run_e2e: decision.runE2e,
  };
  const lines = Object.entries(outputs).map(([key, value]) => `${key}=${value}`);
  console.log(
    `${event} to ${target}, ${changedPaths ? `${changedPaths.length} changed path(s)` : 'changed paths unknown'}:`,
  );
  for (const line of lines) console.log(`  ${line}`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
  }
  return 0;
}

function verdict({ needs, tier }) {
  const results = Object.fromEntries(
    Object.entries(JSON.parse(needs)).map(([job, { result }]) => [job, result]),
  );
  const decision = decideVerdict({ tier: tier || undefined, results });
  report('CI OK', decision);
  return decision.ok ? 0 : 1;
}

const USAGE = `Usage:
  cli.mjs branch-policy --head <branch> [--base <branch>]
  cli.mjs plan --event <pull_request|push> --target <branch> --expect-tier <fast|strict> [--changed-files <file>]
  cli.mjs verdict --needs <json> [--tier <fast|strict>]`;

function main(argv) {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      head: { type: 'string' },
      base: { type: 'string' },
      event: { type: 'string' },
      target: { type: 'string' },
      'changed-files': { type: 'string' },
      'expect-tier': { type: 'string' },
      needs: { type: 'string' },
      tier: { type: 'string' },
    },
  });
  const [command] = positionals;
  if (command === 'branch-policy' && values.head) {
    return checkBranchPolicy({ head: values.head, base: values.base }) ? 0 : 1;
  }
  if (command === 'plan' && values.event && values.target && values['expect-tier']) {
    return plan({
      event: values.event,
      target: values.target,
      expectedTier: values['expect-tier'],
      changedFiles: values['changed-files'],
    });
  }
  if (command === 'verdict' && values.needs) {
    return verdict({ needs: values.needs, tier: values.tier });
  }
  console.error(USAGE);
  return 2;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
