#!/usr/bin/env node
// CLI entry point for CI workflows and automation scripts.
// All business logic and decisions reside in ci-policy.mjs.
//
// Usage:
//   node .github/scripts/ci-cli.mjs branch-policy --head <branch> [--base <branch>]
//   node .github/scripts/ci-cli.mjs plan --event <pull_request|push|workflow_dispatch> --target <branch> [--head <branch>] [--expect-tier <fast|strict>] [--changed-files <file>] [--force-build] [--force-install] [--full-tests]
//   node .github/scripts/ci-cli.mjs verdict --needs <json> [--tier <fast|strict>]

import { appendFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  buildPlanTokens,
  coreTokensFromEnv,
  loadReportConfig,
  renderTemplate,
  resolveTheme,
} from './ci-report.mjs';
import { decideBranchName, decidePlan, decideReleaseSource, decideVerdict } from './ci-policy.mjs';

function reportOutcome(title, { ok, reason }) {
  if (ok) {
    console.log(`✔ ${title}: ${reason}`);
  } else if (process.env.GITHUB_ACTIONS === 'true') {
    console.log(`::error title=${title}::${reason}`);
  } else {
    console.error(`✖ ${title}: ${reason}`);
  }
}

function checkBranchPolicy({ head, base }) {
  const evaluations = [
    ['Branch name', decideBranchName({ head, base })],
    ['Release source', decideReleaseSource({ head, base })],
  ];
  for (const [title, decision] of evaluations) {
    reportOutcome(title, decision);
  }
  return evaluations.every(([, decision]) => decision.ok);
}

function parseChangedPaths(filePath) {
  if (!filePath) return undefined;
  return readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

// The plan summary is a convenience: a report failure warns but never fails the plan.
function writePlanSummary(decision, options) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  try {
    const config = loadReportConfig(join(dirname(fileURLToPath(import.meta.url)), '../config'));
    const tokens = { ...coreTokensFromEnv(process.env), ...buildPlanTokens(decision, options) };
    const status = decision.ok ? 'info' : 'failure';
    const summary = renderTemplate({
      template: config.templates['plan.md'],
      theme: resolveTheme(config.themes, status),
      tokens: { ...tokens, STATUS: status },
    });
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
  } catch (error) {
    console.log(`::warning title=Plan summary::${error.message}`);
  }
}

function executePlan({
  event,
  target,
  head,
  expectedTier,
  changedFiles,
  forceBuild,
  forceInstall,
  fullTests,
}) {
  const changedPaths = parseChangedPaths(changedFiles);
  const decision = decidePlan({
    event,
    target,
    head,
    expectedTier,
    changedPaths,
    forceBuild,
    forceInstall,
    fullTests,
  });
  reportOutcome('Tier', decision);
  writePlanSummary(decision, { forceBuild, forceInstall, fullTests });
  if (!decision.ok) return 1;

  const outputs = {
    tier: decision.tier,
    turbo_flags: decision.turboFlags,
    fetch_depth: decision.fetchDepth,
    restore_deps: decision.restoreDeps,
    restore_build: decision.restoreBuild,
    save_cache: decision.saveCache,
    run_checks: decision.runChecks,
    run_integration: decision.runIntegration,
    run_e2e: decision.runE2e,
  };

  const outputLines = Object.entries(outputs).map(([key, value]) => `${key}=${value}`);
  console.log(
    `${event} to ${target}, ${changedPaths ? `${changedPaths.length} changed path(s)` : 'changed paths unknown'}:`,
  );
  for (const line of outputLines) {
    console.log(`  ${line}`);
  }

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${outputLines.join('\n')}\n`);
  }
  return 0;
}

function executeVerdict({ needs, tier }) {
  const jobResults = Object.fromEntries(
    Object.entries(JSON.parse(needs)).map(([job, { result }]) => [job, result]),
  );
  const decision = decideVerdict({ tier: tier || undefined, results: jobResults });
  reportOutcome('CI OK', decision);
  return decision.ok ? 0 : 1;
}

const CLI_USAGE_HELP = `Usage:
  ci-cli.mjs branch-policy --head <branch> [--base <branch>]
  ci-cli.mjs plan --event <pull_request|push|workflow_dispatch> --target <branch> [--head <branch>] [--expect-tier <fast|strict>] [--changed-files <file>] [--force-build] [--force-install] [--full-tests]
  ci-cli.mjs verdict --needs <json> [--tier <fast|strict>]`;

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
      'force-build': { type: 'boolean' },
      'force-install': { type: 'boolean' },
      'full-tests': { type: 'boolean' },
      needs: { type: 'string' },
      tier: { type: 'string' },
    },
  });

  const [command] = positionals;

  if (command === 'branch-policy' && values.head) {
    return checkBranchPolicy({ head: values.head, base: values.base }) ? 0 : 1;
  }

  if (command === 'plan' && values.event && values.target) {
    return executePlan({
      event: values.event,
      target: values.target,
      head: values.head,
      expectedTier: values['expect-tier'],
      changedFiles: values['changed-files'],
      forceBuild: values['force-build'],
      forceInstall: values['force-install'],
      fullTests: values['full-tests'],
    });
  }

  if (command === 'verdict' && values.needs) {
    return executeVerdict({ needs: values.needs, tier: values.tier });
  }

  console.error(CLI_USAGE_HELP);
  return 2;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
