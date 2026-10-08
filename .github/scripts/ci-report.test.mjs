// Behaviour of the CI report renderer. Run with `node --test .github/scripts/ci-report.test.mjs`.

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { decidePlan } from './ci-policy.mjs';
import {
  coreTokensFromEnv,
  CORE_TOKENS,
  E2E_TOKENS,
  PLAN_TOKENS,
  buildPlanTokens,
  loadReportConfig,
  renderTemplate,
  resolveTheme,
  tokensIn,
} from './ci-report.mjs';

const configDir = fileURLToPath(new URL('../config', import.meta.url));
const cliPath = fileURLToPath(new URL('./ci-report-cli.mjs', import.meta.url));
const { themes, settings, templates } = loadReportConfig(configDir);

const theme = { emoji: '✅', color: '2EA44F', label: 'Succeeded' };

const sampleValue = (name) => `<${name.toLowerCase()}>`;
const sampleTokens = (names) => Object.fromEntries(names.map((name) => [name, sampleValue(name)]));

describe('tokensIn', () => {
  it('lists each %UPPER_SNAKE% token once, in order of first appearance', () => {
    assert.deepEqual(tokensIn('%B% and %A% and %B% and 50% of %C_1%'), ['B', 'A', 'C_1']);
  });

  it('finds tokens inside HTML comments', () => {
    assert.deepEqual(tokensIn('x\n<!-- ![%SPEC%](%URL%) -->'), ['SPEC', 'URL']);
  });

  it('ignores lowercase and unclosed percent signs', () => {
    assert.deepEqual(tokensIn('100% sure, %not_a_token%, 5%'), []);
  });
});

describe('renderTemplate', () => {
  it('substitutes tokens and fills the status fields from the theme', () => {
    const output = renderTemplate({
      template: '%STATUS_EMOJI% %STATUS_LABEL% (#%THEME_COLOR%) %BRANCH% %BRANCH%',
      theme,
      tokens: { BRANCH: 'develop' },
    });
    assert.equal(output, '✅ Succeeded (#2EA44F) develop develop');
  });

  it('does not substitute inside substituted values', () => {
    const output = renderTemplate({
      template: '%A%',
      theme,
      tokens: { A: '%B%', B: 'nope' },
    });
    assert.equal(output, '%B%');
  });

  it('throws listing every token that has no value', () => {
    assert.throws(
      () => renderTemplate({ template: '%KNOWN% %TYPO% %OTHER%', theme, tokens: { KNOWN: 'x' } }),
      (error) => /TYPO/.test(error.message) && /OTHER/.test(error.message),
    );
  });

  it('accepts an empty string and numbers as values but not undefined or null', () => {
    assert.equal(renderTemplate({ template: '[%A%]%B%', theme, tokens: { A: '', B: 3 } }), '[]3');
    assert.throws(() => renderTemplate({ template: '%A%', theme, tokens: { A: undefined } }), /A/);
    assert.throws(() => renderTemplate({ template: '%A%', theme, tokens: { A: null } }), /A/);
  });

  it('escapes values for JSON string literals when asked for json output', () => {
    const output = renderTemplate({
      template: '{"text":"%A%"}',
      theme,
      tokens: { A: 'say "hi"\nthen\\go' },
      format: 'json',
    });
    assert.deepEqual(JSON.parse(output), { text: 'say "hi"\nthen\\go' });
  });
});

describe('resolveTheme', () => {
  it('returns the entry for a status', () => {
    assert.equal(resolveTheme(themes, 'failure').label, 'Failed');
  });

  it('throws on an unknown status, naming the known ones', () => {
    assert.throws(
      () => resolveTheme(themes, 'exploded'),
      (error) => /exploded/.test(error.message) && /success/.test(error.message),
    );
  });
});

describe('the real config files', () => {
  it('give every status an emoji, a hex colour without # and a label', () => {
    for (const status of ['success', 'failure', 'warning', 'skipped', 'running', 'info']) {
      const entry = resolveTheme(themes, status);
      assert.ok(entry.emoji, `${status} emoji`);
      assert.match(entry.color, /^[0-9A-Fa-f]{6}$/, `${status} color`);
      assert.ok(entry.label, `${status} label`);
    }
  });

  it('define the documented settings', () => {
    assert.deepEqual(settings, {
      max_log_lines: 50,
      collapse_logs: true,
      enable_error_analysis: true,
      screenshot_mode: 'link',
      max_screenshots: 3,
      evidence_retention_days: 14,
    });
  });

  it('keep the report token sets free of duplicates', () => {
    for (const set of [CORE_TOKENS, PLAN_TOKENS, E2E_TOKENS]) {
      assert.equal(new Set(set).size, set.length);
    }
  });

  const knownTokens = {
    'plan.md': [...CORE_TOKENS, ...PLAN_TOKENS],
    'e2e.md': [...CORE_TOKENS, ...E2E_TOKENS],
    'run-result.slack.json': CORE_TOKENS,
  };

  it('ship exactly the templates this test knows about', () => {
    assert.deepEqual(Object.keys(templates).sort(), Object.keys(knownTokens).sort());
  });

  for (const [name, known] of Object.entries(knownTokens)) {
    it(`only use known tokens in ${name}`, () => {
      const unknown = tokensIn(templates[name]).filter((token) => !known.includes(token));
      assert.deepEqual(unknown, []);
    });
  }

  it('still checks the commented-out screenshot placeholders in e2e.md', () => {
    const used = tokensIn(templates['e2e.md']);
    for (const token of [
      'SCREENSHOT_URL_1',
      'SCREENSHOT_URL_2',
      'SCREENSHOT_URL_3',
      'SCREENSHOT_SPEC_1',
      'SCREENSHOT_SPEC_2',
      'SCREENSHOT_SPEC_3',
      'SCREENSHOT_MORE',
    ]) {
      assert.ok(used.includes(token), token);
      assert.ok(E2E_TOKENS.includes(token), token);
    }
    assert.match(templates['e2e.md'], /<!--[^]*%SCREENSHOT_URL_1%[^]*-->/);
  });

  it('render e2e.md with sample values and fail when a placeholder token is missing', () => {
    const tokens = sampleTokens([...CORE_TOKENS, ...E2E_TOKENS]);
    const output = renderTemplate({ template: templates['e2e.md'], theme, tokens });
    assert.doesNotMatch(output, /%[A-Z][A-Z0-9_]*%/);
    delete tokens.SCREENSHOT_URL_3;
    assert.throws(
      () => renderTemplate({ template: templates['e2e.md'], theme, tokens }),
      /SCREENSHOT_URL_3/,
    );
  });

  it('render plan.md without leftover tokens', () => {
    const tokens = sampleTokens([...CORE_TOKENS, ...PLAN_TOKENS]);
    const output = renderTemplate({ template: templates['plan.md'], theme, tokens });
    assert.doesNotMatch(output, /%[A-Z][A-Z0-9_]*%/);
    assert.match(output, /<tier>/);
  });

  it('render the Slack card as valid JSON, whatever characters the values hold', () => {
    const tokens = sampleTokens(CORE_TOKENS);
    tokens.CHANGELOG_SNIPPET = 'Fixed "quotes"\n- a line with \\ backslash';
    tokens.WORKFLOW = 'CI · Strict';
    const output = renderTemplate({
      template: templates['run-result.slack.json'],
      theme: resolveTheme(themes, 'failure'),
      tokens,
      format: 'json',
    });
    const card = JSON.parse(output);
    const [attachment] = card.attachments;
    assert.equal(attachment.color, '#CF222E');
    assert.equal(attachment.blocks[0].text.text, '❌ CI · Strict Failed');
    assert.equal(attachment.blocks[2].text.text, tokens.CHANGELOG_SNIPPET);
    const [runButton, changelogButton] = attachment.blocks[3].elements;
    assert.equal(runButton.url, tokens.RUN_URL);
    assert.equal(changelogButton.url, tokens.CHANGELOG_URL);
  });
});

describe('buildPlanTokens', () => {
  it('describes a fast pull request plan', () => {
    const plan = decidePlan({
      event: 'pull_request',
      target: 'develop',
      head: 'feat/some-feature',
      changedPaths: ['docs/notes.md'],
    });
    assert.deepEqual(buildPlanTokens(plan, {}), {
      TIER: 'fast',
      TIER_REASON: 'pull request into develop: affected packages with caches restored',
      TURBO_FLAGS: '--affected',
      RESTORE_DEPS: 'restored',
      RESTORE_BUILD: 'restored',
      SAVE_CACHE: 'not saved',
      FORCE_BUILD: 'no',
      FORCE_INSTALL: 'no',
      RUN_CHECKS: 'no',
      RUN_INTEGRATION: 'no',
      RUN_E2E: 'no',
    });
  });

  it('describes a manual run that forces the build and the install', () => {
    const plan = decidePlan({
      event: 'workflow_dispatch',
      target: 'develop',
      forceBuild: true,
      forceInstall: true,
    });
    assert.deepEqual(buildPlanTokens(plan, { forceBuild: true, forceInstall: true }), {
      TIER: 'fast',
      TIER_REASON: 'manual run: all packages with caches restored unless forced',
      TURBO_FLAGS: '--force',
      RESTORE_DEPS: 'skipped (clean install forced)',
      RESTORE_BUILD: 'skipped (build forced)',
      SAVE_CACHE: 'saved after the run',
      FORCE_BUILD: 'yes',
      FORCE_INSTALL: 'yes',
      RUN_CHECKS: 'yes',
      RUN_INTEGRATION: 'yes',
      RUN_E2E: 'no',
    });
  });

  it('shows no flags for an unforced manual run', () => {
    const plan = decidePlan({ event: 'workflow_dispatch', target: 'feat/x' });
    assert.equal(buildPlanTokens(plan, {}).TURBO_FLAGS, 'none');
  });

  it('says force options are ignored outside manual runs', () => {
    const plan = decidePlan({
      event: 'pull_request',
      target: 'develop',
      head: 'feat/x',
      changedPaths: ['backend/a.ts'],
    });
    const tokens = buildPlanTokens(plan, { forceBuild: true, forceInstall: true });
    assert.match(tokens.FORCE_BUILD, /ignored/);
    assert.match(tokens.FORCE_INSTALL, /ignored/);
    assert.equal(tokens.RESTORE_BUILD, 'restored');
  });

  it('describes a strict push that restores nothing and saves the caches', () => {
    const plan = decidePlan({ event: 'push', target: 'develop', changedPaths: ['README.md'] });
    const tokens = buildPlanTokens(plan, {});
    assert.equal(tokens.TIER, 'strict');
    assert.equal(tokens.TURBO_FLAGS, '--force');
    assert.equal(tokens.RESTORE_DEPS, 'not restored (run from scratch)');
    assert.equal(tokens.RESTORE_BUILD, 'not restored (run from scratch)');
    assert.equal(tokens.SAVE_CACHE, 'saved after the run');
    assert.equal(tokens.RUN_E2E, 'yes');
  });

  it('gives every token the plan template needs besides the core set', () => {
    const plan = decidePlan({ event: 'push', target: 'develop' });
    assert.deepEqual(Object.keys(buildPlanTokens(plan, {})).sort(), [...PLAN_TOKENS].sort());
  });
});

describe('loadReportConfig', () => {
  it('keys templates by file name', () => {
    assert.ok(templates['plan.md'].startsWith('## '));
  });

  it('fails clearly for a missing directory', () => {
    assert.throws(() => loadReportConfig(join(tmpdir(), 'no-such-report-config-dir')), /config/i);
  });
});

describe('ci-report-cli render', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ci-report-'));
  const tokensFile = join(dir, 'tokens.json');
  writeFileSync(tokensFile, JSON.stringify(sampleTokens([...CORE_TOKENS, ...PLAN_TOKENS])));

  it('prints the rendered template', () => {
    const output = execFileSync(
      process.execPath,
      [cliPath, 'render', '--template', 'plan.md', '--status', 'success', '--tokens', tokensFile],
      { encoding: 'utf8' },
    );
    assert.match(output, /^## ✅ Plan: <tier> tier/);
  });

  it('accepts a template name without its extension', () => {
    const result = spawnSync(
      process.execPath,
      [cliPath, 'render', '--template', 'plan', '--status', 'info', '--tokens', tokensFile],
      { encoding: 'utf8' },
    );
    assert.equal(result.status, 0);
    assert.match(result.stdout, /ℹ️/);
  });

  it('exits 1 with a clear message for an unknown status', () => {
    const result = spawnSync(
      process.execPath,
      [cliPath, 'render', '--template', 'plan.md', '--status', 'bogus', '--tokens', tokensFile],
      { encoding: 'utf8' },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /bogus/);
  });

  it('exits 1 naming the missing tokens', () => {
    const partial = join(dir, 'partial.json');
    writeFileSync(partial, JSON.stringify({ WORKFLOW: 'CI' }));
    const result = spawnSync(
      process.execPath,
      [cliPath, 'render', '--template', 'plan.md', '--status', 'success', '--tokens', partial],
      { encoding: 'utf8' },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /TIER/);
  });

  it('renders JSON templates with escaped values', () => {
    const slackTokens = join(dir, 'slack.json');
    writeFileSync(
      slackTokens,
      JSON.stringify({ ...sampleTokens(CORE_TOKENS), CHANGELOG_SNIPPET: 'a "quoted"\nline' }),
    );
    const output = execFileSync(
      process.execPath,
      [
        cliPath,
        'render',
        '--template',
        'run-result.slack.json',
        '--status',
        'failure',
        '--tokens',
        slackTokens,
      ],
      { encoding: 'utf8' },
    );
    assert.equal(JSON.parse(output).attachments[0].blocks[2].text.text, 'a "quoted"\nline');
  });

  it('exits 2 with usage when arguments are missing', () => {
    const result = spawnSync(process.execPath, [cliPath, 'render'], { encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Usage/);
  });
});

describe('coreTokensFromEnv', () => {
  const env = {
    GITHUB_REPOSITORY: 'acme/app',
    GITHUB_WORKFLOW: 'CI · Feature',
    GITHUB_JOB: 'plan',
    GITHUB_REF_NAME: 'develop',
    GITHUB_HEAD_REF: 'feat/x',
    GITHUB_SHA: '0123456789abcdef',
    GITHUB_ACTOR: 'octo',
    GITHUB_SERVER_URL: 'https://github.com',
    GITHUB_RUN_ID: '42',
  };

  it('reads the run context from the Actions environment', () => {
    const tokens = coreTokensFromEnv(env, new Date('2026-10-08T12:00:00Z'));
    assert.equal(tokens.REPO_NAME, 'acme/app');
    assert.equal(tokens.WORKFLOW, 'CI · Feature');
    assert.equal(tokens.SHA, '0123456');
    assert.equal(tokens.ACTOR, 'octo');
    assert.equal(tokens.TIME, '2026-10-08 12:00:00');
    assert.equal(tokens.RUN_URL, 'https://github.com/acme/app/actions/runs/42');
  });

  it('prefers the PR head branch and falls back to the ref name', () => {
    assert.equal(coreTokensFromEnv(env).BRANCH, 'feat/x');
    assert.equal(coreTokensFromEnv({ ...env, GITHUB_HEAD_REF: '' }).BRANCH, 'develop');
  });

  it('points the changelog at the run when there is none, so no token is empty or missing', () => {
    const tokens = coreTokensFromEnv(env);
    assert.equal(tokens.CHANGELOG_URL, tokens.RUN_URL);
    assert.equal(tokens.CHANGELOG_SNIPPET, '_No changelog entry._');
  });
});
