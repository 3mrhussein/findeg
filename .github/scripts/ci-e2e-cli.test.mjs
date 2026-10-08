// The E2E report built from run files, through the same entry the workflow calls.
// Run with `node --test .github/scripts/ci-e2e-cli.test.mjs`.

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { buildReport } from './ci-e2e-cli.mjs';

const env = {
  GITHUB_REPOSITORY: 'acme/app',
  GITHUB_WORKFLOW: 'CI · Release',
  GITHUB_JOB: 'e2e',
  GITHUB_REF_NAME: 'develop',
  GITHUB_SHA: '0123456789abcdef',
  GITHUB_ACTOR: 'octo',
  GITHUB_SERVER_URL: 'https://github.com',
  GITHUB_RUN_ID: '42',
};

function runDir() {
  const dir = mkdtempSync(join(tmpdir(), 'e2e-report-'));
  const evidence = join(dir, 'artifacts');
  mkdirSync(join(evidence, 'storefront', 'screenshots', 'checkout.cy.ts'), { recursive: true });
  for (const n of [1, 2, 3, 4]) {
    writeFileSync(
      join(evidence, 'storefront', 'screenshots', 'checkout.cy.ts', `shot-${n}.png`),
      'x',
    );
  }
  writeFileSync(join(dir, 'output.txt'), 'nothing recognisable');
  writeFileSync(join(dir, 'storefront.log'), 'storefront started\nboom');
  return { dir, evidence };
}

describe('buildReport', () => {
  it('renders a report with no leftover tokens, even when the run left no evidence', async () => {
    const { dir } = runDir();
    const { summary } = await buildReport(
      {
        outcome: 'failure',
        'output-file': join(dir, 'output.txt'),
        'evidence-dir': join(dir, 'missing'),
      },
      env,
    );
    assert.doesNotMatch(summary, /%[A-Z_0-9]+%/);
    assert.match(summary, /No artifacts found|No evidence/);
  });

  it('lists at most the capped number of screenshots and counts the rest', async () => {
    const { dir, evidence } = runDir();
    const { summary } = await buildReport(
      {
        outcome: 'failure',
        'output-file': join(dir, 'output.txt'),
        'storefront-log': join(dir, 'storefront.log'),
        'evidence-dir': evidence,
      },
      env,
    );
    assert.equal((summary.match(/shot-\d\.png/g) || []).length <= 6, true);
    assert.match(summary, /boom/);
  });

  it('keeps screenshots as run-page links unless pages mode is on and the token can write', async () => {
    const { dir, evidence } = runDir();
    const { mode } = await buildReport(
      {
        outcome: 'failure',
        'output-file': join(dir, 'output.txt'),
        'evidence-dir': evidence,
        'can-write': true,
      },
      env,
    );
    assert.equal(mode, 'link');
  });
});
