// CI Report: renders report templates (job summaries, chat cards) from tokens and a status theme.
// Everything here is pure except `loadReportConfig`, the one function that reads the config files.
// Templates, themes and tokens are described in docs/development/ci-workflow-standards.md (section 6).

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Tokens every report may use. */
export const CORE_TOKENS = [
  'STATUS',
  'STATUS_EMOJI',
  'THEME_COLOR',
  'STATUS_LABEL',
  'REPO_NAME',
  'WORKFLOW',
  'JOB',
  'BRANCH',
  'SHA',
  'ACTOR',
  'TIME',
  'DURATION',
  'RUN_URL',
  'CHANGELOG_SNIPPET',
  'CHANGELOG_URL',
];

/** Tokens specific to the plan summary, filled by `buildPlanTokens`. */
export const PLAN_TOKENS = [
  'TIER',
  'TIER_REASON',
  'TURBO_FLAGS',
  'RESTORE_DEPS',
  'RESTORE_BUILD',
  'SAVE_CACHE',
  'FORCE_BUILD',
  'FORCE_INSTALL',
  'RUN_CHECKS',
  'RUN_INTEGRATION',
  'RUN_E2E',
];

/** Tokens specific to the E2E summary. The screenshot ones are also used by the commented block. */
export const E2E_TOKENS = [
  'FAILED_SPECS',
  'LOG_EXCERPT_STOREFRONT',
  'LOG_EXCERPT_DASHBOARD',
  'EVIDENCE_STATUS',
  'SCREENSHOT_URL_1',
  'SCREENSHOT_URL_2',
  'SCREENSHOT_URL_3',
  'SCREENSHOT_SPEC_1',
  'SCREENSHOT_SPEC_2',
  'SCREENSHOT_SPEC_3',
  'SCREENSHOT_MORE',
  'SCREENSHOT_LIST',
];

const TOKEN_PATTERN = /%([A-Z][A-Z0-9_]*)%/g;

/**
 * Names of the distinct tokens in a template, in order of first appearance.
 * Tokens inside HTML comments count, so commented-out blocks are validated too.
 */
export function tokensIn(template) {
  return [...new Set([...template.matchAll(TOKEN_PATTERN)].map((match) => match[1]))];
}

/**
 * Returns the theme entry ({ emoji, color, label }) for a status.
 */
export function resolveTheme(themes, status) {
  const entry = Object.hasOwn(themes, status) ? themes[status] : undefined;
  if (!entry) {
    throw new Error(
      `Unknown status "${status}". Known statuses: ${Object.keys(themes).join(', ')}.`,
    );
  }
  for (const field of ['emoji', 'color', 'label']) {
    if (typeof entry[field] !== 'string' || entry[field] === '') {
      throw new Error(`Theme for status "${status}" has no "${field}".`);
    }
  }
  return entry;
}

const escapeJsonString = (value) => JSON.stringify(value).slice(1, -1);

/**
 * Fills a template. The theme supplies STATUS_EMOJI, THEME_COLOR and STATUS_LABEL.
 * Throws, listing them all, if the template holds a token that has no value.
 * With `format: 'json'`, values are escaped to sit inside a JSON string literal.
 * Substitution is a single pass, so a value that looks like a token is left alone.
 */
export function renderTemplate({ template, theme, tokens, format = 'text' }) {
  const values = {
    ...tokens,
    STATUS_EMOJI: theme.emoji,
    THEME_COLOR: theme.color,
    STATUS_LABEL: theme.label,
  };
  const hasValue = (name) => values[name] !== undefined && values[name] !== null;

  const missing = tokensIn(template).filter((name) => !hasValue(name));
  if (missing.length > 0) {
    throw new Error(
      `Template has tokens with no value: ${missing.map((n) => `%${n}%`).join(', ')}.`,
    );
  }

  return template.replace(TOKEN_PATTERN, (_match, name) => {
    const text = String(values[name]);
    return format === 'json' ? escapeJsonString(text) : text;
  });
}

const yesNo = (flag) => (flag ? 'yes' : 'no');

function describeRestore({ restored, forced, forcedLabel }) {
  if (restored) return 'restored';
  if (forced) return `skipped (${forcedLabel})`;
  return 'not restored (run from scratch)';
}

function describeForce({ requested, effective }) {
  if (effective) return 'yes';
  if (requested) return 'ignored (only manual runs honour force options)';
  return 'no';
}

/**
 * Turns the object returned by `decidePlan` into the plan summary's tokens.
 * `forceBuild` and `forceInstall` are the options the caller asked for; they only take effect
 * on manual runs, which the plan shows by leaving the matching cache unrestored on the fast tier.
 */
export function buildPlanTokens(plan, { forceBuild = false, forceInstall = false } = {}) {
  const buildForced = forceBuild && plan.tier === 'fast' && !plan.restoreBuild;
  const installForced = forceInstall && plan.tier === 'fast' && !plan.restoreDeps;

  return {
    TIER: plan.tier,
    TIER_REASON: plan.tierReason,
    TURBO_FLAGS: plan.turboFlags || 'none',
    RESTORE_DEPS: describeRestore({
      restored: plan.restoreDeps,
      forced: installForced,
      forcedLabel: 'clean install forced',
    }),
    RESTORE_BUILD: describeRestore({
      restored: plan.restoreBuild,
      forced: buildForced,
      forcedLabel: 'build forced',
    }),
    SAVE_CACHE: plan.saveCache ? 'saved after the run' : 'not saved',
    FORCE_BUILD: describeForce({ requested: forceBuild, effective: buildForced }),
    FORCE_INSTALL: describeForce({ requested: forceInstall, effective: installForced }),
    RUN_CHECKS: yesNo(plan.runChecks),
    RUN_INTEGRATION: yesNo(plan.runIntegration),
    RUN_E2E: yesNo(plan.runE2e),
  };
}

/**
 * The core tokens that come from the Actions run context. Status tokens are filled by the theme;
 * DURATION is left to the caller. With no changelog, its URL points at the run so cards stay valid.
 */
export function coreTokensFromEnv(env, now = new Date()) {
  const runUrl = `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`;
  return {
    REPO_NAME: env.GITHUB_REPOSITORY,
    WORKFLOW: env.GITHUB_WORKFLOW,
    JOB: env.GITHUB_JOB,
    BRANCH: env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME,
    SHA: (env.GITHUB_SHA || '').slice(0, 7),
    ACTOR: env.GITHUB_ACTOR,
    TIME: now.toISOString().slice(0, 19).replace('T', ' '),
    DURATION: '',
    RUN_URL: runUrl,
    CHANGELOG_SNIPPET: '_No changelog entry._',
    CHANGELOG_URL: runUrl,
  };
}

/**
 * Reads the report config directory: themes.json, settings.json and every file in templates/.
 * Templates are keyed by file name (for example "plan.md"). The only function here that touches disk.
 */
export function loadReportConfig(dir) {
  try {
    const readJson = (name) => JSON.parse(readFileSync(join(dir, name), 'utf8'));
    const templateDir = join(dir, 'templates');
    const templates = Object.fromEntries(
      readdirSync(templateDir).map((name) => [name, readFileSync(join(templateDir, name), 'utf8')]),
    );
    return { themes: readJson('themes.json'), settings: readJson('settings.json'), templates };
  } catch (error) {
    throw new Error(`Cannot load report config from "${dir}": ${error.message}`, { cause: error });
  }
}
