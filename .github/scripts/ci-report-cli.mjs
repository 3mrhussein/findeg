#!/usr/bin/env node
// CLI entry point for rendering CI reports. All logic lives in ci-report.mjs.
//
// Usage:
//   node .github/scripts/ci-report-cli.mjs render --template <name> --status <status> [--tokens <json file>] [--env] [--config <dir>]
//
// --env fills the core tokens from the Actions run context; --tokens adds or overrides values.
// Prints the rendered report to stdout. Templates ending in .json are rendered with
// JSON-escaped values. Exits 1 with a message on stderr when rendering fails.

import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { coreTokensFromEnv, loadReportConfig, renderTemplate, resolveTheme } from './ci-report.mjs';

const DEFAULT_CONFIG_DIR = fileURLToPath(new URL('../config', import.meta.url));

const CLI_USAGE_HELP = `Usage:
  ci-report-cli.mjs render --template <name> --status <success|failure|warning|skipped|running|info> [--tokens <json file>] [--env] [--config <dir>]`;

function findTemplate(templates, name) {
  const key = [name, `${name}.md`].find((candidate) => Object.hasOwn(templates, candidate));
  if (!key) {
    throw new Error(`Unknown template "${name}". Available: ${Object.keys(templates).join(', ')}.`);
  }
  return key;
}

function render({ template: name, status, tokens: tokensFile, env, config = DEFAULT_CONFIG_DIR }) {
  const { themes, templates } = loadReportConfig(config);
  const key = findTemplate(templates, name);
  const tokens = {
    ...(env ? coreTokensFromEnv(process.env) : {}),
    ...(tokensFile ? JSON.parse(readFileSync(tokensFile, 'utf8')) : {}),
  };
  return renderTemplate({
    template: templates[key],
    theme: resolveTheme(themes, status),
    tokens: { STATUS: status, ...tokens },
    format: key.endsWith('.json') ? 'json' : 'text',
  });
}

function main(argv) {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      template: { type: 'string' },
      status: { type: 'string' },
      tokens: { type: 'string' },
      env: { type: 'boolean' },
      config: { type: 'string' },
    },
  });

  if (
    positionals[0] !== 'render' ||
    !values.template ||
    !values.status ||
    !(values.tokens || values.env)
  ) {
    console.error(CLI_USAGE_HELP);
    return 2;
  }

  try {
    process.stdout.write(render(values));
    return 0;
  } catch (error) {
    console.error(`✖ Report: ${error.message}`);
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
