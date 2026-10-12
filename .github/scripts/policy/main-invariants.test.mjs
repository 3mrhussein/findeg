// The standing rule (ADR-0015): main never skips a test or uses a cache. It spans the
// plan, the verdict and PR titles, so it tests them together through ci-policy.mjs. Run with `node --test .github/scripts`.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { decidePlan, decidePrTitle, decideVerdict } from '../ci-policy.mjs';

const codeChange = ['backend/src/index.ts'];

// The forever rule: nothing that reaches or runs on main skips a test or restores a cache.
describe('main never skips a test or uses a cache', () => {
  const docsOnly = ['docs/readme.md'];
  const everyWayIntoMain = [
    { event: 'pull_request', target: 'main', head: 'develop' },
    { event: 'pull_request', target: 'main', head: 'hotfix/fix-x' },
    { event: 'pull_request', target: 'main', head: 'release-please--branches--main' },
    { event: 'pull_request', target: 'main', head: 'feat/sneaky' },
    { event: 'push', target: 'main' },
    { event: 'workflow_dispatch', target: 'main' },
    { event: 'workflow_dispatch', target: 'main', forceBuild: false, fullTests: false },
  ];

  for (const input of everyWayIntoMain) {
    for (const changedPaths of [docsOnly, codeChange, undefined]) {
      it(`${input.event} into main from ${input.head ?? 'main'} (${changedPaths?.[0] ?? 'diff unknown'})`, () => {
        const plan = decidePlan({ ...input, changedPaths });
        assert.equal(plan.tier, 'strict');
        assert.equal(plan.turboFlags, '--force');
        assert.equal(plan.restoreDeps, false);
        assert.equal(plan.restoreBuild, false);
        assert.equal(plan.saveCache, false);
        assert.equal(plan.runChecks, true);
        assert.equal(plan.runIntegration, true);
        assert.equal(plan.runE2e, true);
      });
    }
  }

  it('fails a strict run when any job was skipped, not only E2E', () => {
    const all = {
      plan: 'success',
      checks: 'success',
      architecture: 'success',
      build: 'success',
      integration: 'success',
      e2e: 'success',
    };
    for (const job of ['checks', 'architecture', 'build', 'integration', 'e2e']) {
      const decision = decideVerdict({ tier: 'strict', results: { ...all, [job]: 'skipped' } });
      assert.equal(decision.ok, false, `${job} skipped`);
    }
    assert.equal(decideVerdict({ tier: 'strict', results: all }).ok, true);
  });

  it('rejects PR titles that would make GitHub skip the push run on main', () => {
    for (const title of [
      'chore: promote develop to main [skip ci]',
      'Chore | Promote [CI SKIP]',
      'fix: x [no ci]',
      'fix: x [skip actions]',
      'fix: x [actions skip]',
      'fix: x skip-checks: true',
      'fix: x skip-checks:true',
    ]) {
      assert.equal(decidePrTitle({ title, base: 'main' }).ok, false, title);
    }
  });

  // A job missing from the Gate's `needs` would be optional without anyone noticing: its
  // failure could never fail `CI / Gate`. Only jobs that report on the Gate may stay out.
  it('feeds every test job into the Gate', () => {
    const workflow = readFileSync(new URL('../../workflows/ci-jobs.yml', import.meta.url), 'utf8');
    const jobs = [...workflow.matchAll(/^ {2}([a-z][a-z0-9-]*):$/gm)].map((match) => match[1]);
    const needs = /^ {2}gate:\n(?:.*\n)*? {4}needs: \[([^\]]+)\]/m
      .exec(workflow)[1]
      .split(',')
      .map((job) => job.trim());
    const reportOnly = ['gate', 'notify', 'publish-evidence'];
    assert.ok(jobs.includes('architecture'));
    assert.deepEqual(jobs.filter((job) => !reportOnly.includes(job)).sort(), [...needs].sort());
  });
});
