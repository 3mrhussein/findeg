#!/usr/bin/env node
// CLI entry point for CI workflows and automation scripts.
// All business logic and decisions reside in ci-policy.mjs.
//
// Usage:
//   node .github/scripts/ci-cli.mjs branch-policy --head <branch> [--base <branch>]
//   node .github/scripts/ci-cli.mjs plan --event <pull_request|push|workflow_dispatch> --target <branch> [--head <branch>] [--changed-files <file>] [--no-cache true] [--full-tests true] [--merged-head <branch>]
//     (the yes/no options take `true`; any other value, empty included, is no, so a workflow
//     can pass its inputs straight through)
//   node .github/scripts/ci-cli.mjs verdict --needs <json> [--tier <fast|strict>]
//   node .github/scripts/ci-cli.mjs pr-title <issue-number|suggest|check> ...
//   node .github/scripts/ci-cli.mjs promote --ref <branch> --sha <sha> --develop-tip <sha> --ahead-by <n> --out <f> [--ci-run-file <f>] [--commits-file <f>]

import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
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
import {
  buildPromotionBody,
  decideBranchName,
  decidePlan,
  decidePrTitle,
  decidePrTitleSuggestion,
  decidePromotion,
  decideReleaseSource,
  decideVerdict,
  issueNumberFromBranch,
} from './ci-policy.mjs';

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

function executePlan(values) {
  const { event, target } = values;
  const yes = (name) => values[name] === 'true';
  // `no_cache` skips both caches: the build caches (with Turbo --force) and the pnpm store.
  const forceBuild = yes('no-cache');
  const forceInstall = forceBuild;
  const fullTests = yes('full-tests');
  const changedPaths = parseChangedPaths(values['changed-files']);
  const decision = decidePlan({
    event,
    target,
    head: values.head,
    changedPaths,
    forceBuild,
    forceInstall,
    fullTests,
    mergedHead: values['merged-head'] || undefined,
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
  reportOutcome('Gate', decision);
  return decision.ok ? 0 : 1;
}

function readOptional(filePath) {
  return filePath ? readFileSync(filePath, 'utf8') : '';
}

// pr-title issue-number --head <branch>       prints the issue the branch names, if any
// pr-title suggest --head <branch> --body-file <f> --out <f> [--title <current>] [--issue-title <t>] [--commit-subject <s>]
// pr-title check --title <t> --body-file <f> [--base <branch>]
function executePrTitle(subcommand, values) {
  if (subcommand === 'issue-number' && values.head) {
    console.log(issueNumberFromBranch(values.head) ?? '');
    return 0;
  }
  if (subcommand === 'suggest' && values.head && values.out) {
    const decision = decidePrTitleSuggestion({
      head: values.head,
      body: readOptional(values['body-file']),
      issueTitle: values['issue-title'],
      commitSubject: values['commit-subject'],
      currentTitle: values.title,
    });
    reportOutcome('PR title suggestion', decision);
    if (!decision.ok) return 1;
    writeFileSync(values.out, JSON.stringify({ title: decision.title, body: decision.body }));
    return 0;
  }
  if (subcommand === 'check' && values.title !== undefined) {
    const decision = decidePrTitle({
      title: values.title,
      body: readOptional(values['body-file']),
      base: values.base,
    });
    reportOutcome('PR title', decision);
    return decision.ok ? 0 : 1;
  }
  return 2;
}

function readJson(filePath, fallback) {
  const text = filePath ? readFileSync(filePath, 'utf8').trim() : '';
  return text ? JSON.parse(text) : fallback;
}

// Decides whether develop may be promoted to main and, when it may, writes the PR's title and
// body to --out. `promote=true|false` goes to GITHUB_OUTPUT; a refusal exits 1 with the reason.
//   --ci-run-file   {"status","gate","url"} of develop's newest push CI run; empty means none
//   --commits-file  [{"subject","parents"}] of the commits develop has that main does not
function executePromote(values) {
  const ciRun = readJson(values['ci-run-file'], undefined);
  const decision = decidePromotion({
    ref: values.ref,
    headSha: values.sha,
    developTip: values['develop-tip'],
    ciRun,
    aheadBy: Number(values['ahead-by'] ?? 0),
  });
  reportOutcome('Promotion', decision);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### ${decision.ok ? (decision.promote ? '✅' : 'ℹ️') : '❌'} Promote ${values.ref ?? ''}\n\n${decision.reason}\n`,
    );
  }
  if (!decision.ok) return 1;
  if (decision.promote) {
    const body = buildPromotionBody({
      headSha: values.sha,
      ciRunUrl: ciRun?.url,
      commits: readJson(values['commits-file'], []),
    });
    writeFileSync(values.out, JSON.stringify({ title: decision.title, body }));
  }
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `promote=${decision.promote}\n`);
  }
  return 0;
}

const CLI_USAGE_HELP = `Usage:
  ci-cli.mjs branch-policy --head <branch> [--base <branch>]
  ci-cli.mjs plan --event <pull_request|push|workflow_dispatch> --target <branch> [--head <branch>] [--changed-files <file>] [--no-cache true] [--full-tests true] [--merged-head <branch>]
  ci-cli.mjs verdict --needs <json> [--tier <fast|strict>]
  ci-cli.mjs pr-title <issue-number|suggest|check> [--head <branch>] [--base <branch>] [--title <t>] [--body-file <f>] [--out <f>] [--issue-title <t>] [--commit-subject <s>]
  ci-cli.mjs promote --ref <branch> --sha <sha> --develop-tip <sha> --ahead-by <n> --out <f> [--ci-run-file <f>] [--commits-file <f>]`;

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
      'no-cache': { type: 'string' },
      'full-tests': { type: 'string' },
      'merged-head': { type: 'string' },
      needs: { type: 'string' },
      tier: { type: 'string' },
      title: { type: 'string' },
      'body-file': { type: 'string' },
      out: { type: 'string' },
      'issue-title': { type: 'string' },
      'commit-subject': { type: 'string' },
      ref: { type: 'string' },
      sha: { type: 'string' },
      'develop-tip': { type: 'string' },
      'ahead-by': { type: 'string' },
      'ci-run-file': { type: 'string' },
      'commits-file': { type: 'string' },
    },
  });

  const [command, subcommand] = positionals;

  if (command === 'branch-policy' && values.head) {
    return checkBranchPolicy({ head: values.head, base: values.base }) ? 0 : 1;
  }

  if (command === 'plan' && values.event && values.target) {
    return executePlan(values);
  }

  if (command === 'verdict' && values.needs) {
    return executeVerdict({ needs: values.needs, tier: values.tier });
  }

  if (command === 'pr-title') {
    const code = executePrTitle(subcommand, values);
    if (code !== 2) return code;
  }

  if (command === 'promote' && values.ref && values.out) {
    return executePromote(values);
  }

  console.error(CLI_USAGE_HELP);
  return 2;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
