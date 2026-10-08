#!/usr/bin/env node
// CLI entry point for the E2E failure report. All logic lives in ci-e2e-report.mjs and ci-report.mjs.
//
// Usage:
//   node .github/scripts/ci-e2e-cli.mjs report --outcome <outcome> --output-file <file>
//     [--storefront-log <file>] [--dashboard-log <file>] [--evidence-dir <dir>]
//     [--artifact-name <name>] [--can-write] [--config <dir>]
//   node .github/scripts/ci-e2e-cli.mjs prune --retention-days <n>   (stdin: "<folder> <commit epoch seconds>" lines)
//
// `report` appends the rendered report to $GITHUB_STEP_SUMMARY and writes `screenshot_mode` to
// $GITHUB_OUTPUT. It never fails the job: a broken report only warns.

import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  buildE2eTokens,
  decideScreenshotMode,
  planPrune,
  readEvidenceDir,
} from './ci-e2e-report.mjs';
import { coreTokensFromEnv, loadReportConfig, renderTemplate, resolveTheme } from './ci-report.mjs';

const DEFAULT_CONFIG_DIR = fileURLToPath(new URL('../config', import.meta.url));

const CLI_USAGE_HELP = `Usage:
  ci-e2e-cli.mjs prune --retention-days <n>   (reads "<folder> <commit epoch seconds>" lines on stdin, prints folders to delete)
  ci-e2e-cli.mjs report --outcome <outcome> --output-file <file> [--storefront-log <file>] [--dashboard-log <file>] [--evidence-dir <dir>] [--artifact-name <name>] [--can-write] [--config <dir>]`;

function readIfPresent(file) {
  return file && existsSync(file) ? readFileSync(file, 'utf8') : '';
}

// Where a screenshot can be seen: its own page when published, else the run's artifact list.
function screenshotUrlFor(mode, env) {
  const [owner, repo] = (env.GITHUB_REPOSITORY || '/').split('/');
  const runUrl = coreTokensFromEnv(env).RUN_URL;
  return mode === 'pages'
    ? (file) => `https://${owner}.github.io/${repo}/runs/${env.GITHUB_RUN_ID}/${file.path}`
    : () => `${runUrl}#artifacts`;
}

export async function buildReport(options, env = process.env) {
  const config = loadReportConfig(options.config || DEFAULT_CONFIG_DIR);
  const { mode } = decideScreenshotMode({
    mode: config.settings.screenshot_mode,
    canWrite: Boolean(options['can-write']),
  });
  const evidenceFiles = options['evidence-dir']
    ? await readEvidenceDir(options['evidence-dir'])
    : [];
  const { tokens, status } = buildE2eTokens({
    outcome: options.outcome,
    outputText: readIfPresent(options['output-file']),
    storefrontLog: readIfPresent(options['storefront-log']),
    dashboardLog: readIfPresent(options['dashboard-log']),
    evidenceFiles,
    maxLogLines: config.settings.max_log_lines,
    screenshotCap: config.settings.max_screenshots,
    urlFor: screenshotUrlFor(mode, env),
    artifactName: options['artifact-name'],
  });
  const summary = renderTemplate({
    template: config.templates['e2e.md'],
    theme: resolveTheme(config.themes, status),
    tokens: { ...coreTokensFromEnv(env), ...tokens, STATUS: status },
  });
  return { summary, mode, status };
}

async function main(argv) {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      outcome: { type: 'string' },
      'output-file': { type: 'string' },
      'storefront-log': { type: 'string' },
      'dashboard-log': { type: 'string' },
      'evidence-dir': { type: 'string' },
      'artifact-name': { type: 'string' },
      'can-write': { type: 'boolean' },
      config: { type: 'string' },
      'retention-days': { type: 'string' },
    },
  });

  if (positionals[0] === 'prune') {
    const folders = readFileSync(0, 'utf8')
      .split('\n')
      .map((line) => line.trim().split(/\s+/))
      .filter(([name, seconds]) => name && seconds)
      .map(([name, seconds]) => ({ name, committedMs: Number(seconds) * 1000 }));
    const days = Number(values['retention-days'] || 14);
    for (const name of planPrune(folders, Date.now(), days)) console.log(name);
    return 0;
  }

  if (positionals[0] !== 'report' || !values.outcome) {
    console.error(CLI_USAGE_HELP);
    return 2;
  }

  try {
    const { summary, mode, status } = await buildReport(values);
    console.log(`E2E report: ${status}, screenshots in ${mode} mode.`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
    } else {
      process.stdout.write(summary);
    }
    if (process.env.GITHUB_OUTPUT) {
      appendFileSync(process.env.GITHUB_OUTPUT, `screenshot_mode=${mode}\n`);
    }
  } catch (error) {
    console.log(`::warning title=E2E report::${error.message}`);
  }
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2));
}
