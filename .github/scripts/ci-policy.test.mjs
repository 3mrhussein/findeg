// Behaviour of the CI plan and verdict decisions. Run with `node --test .github/scripts/ci-policy.test.mjs`.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decideBranchName, decidePlan, decideVerdict } from './ci-policy.mjs';

const codeChange = ['backend/src/index.ts'];

const pullRequestIntoDevelop = {
  event: 'pull_request',
  target: 'develop',
  head: 'feat/some-feature',
  changedPaths: codeChange,
};

describe('decidePlan for a pull request into develop', () => {
  it('runs the fast tier on affected packages with every cache restored and none saved', () => {
    const plan = decidePlan(pullRequestIntoDevelop);
    assert.equal(plan.tier, 'fast');
    assert.equal(plan.turboFlags, '--affected');
    assert.equal(plan.fetchDepth, 0);
    assert.equal(plan.restoreDeps, true);
    assert.equal(plan.restoreBuild, true);
    assert.equal(plan.saveCache, false);
    assert.equal(plan.runE2e, false);
    assert.equal(plan.runChecks, true);
    assert.equal(plan.runIntegration, true);
  });

  it('skips code checks for a docs-only change', () => {
    const plan = decidePlan({ ...pullRequestIntoDevelop, changedPaths: ['docs/notes.md'] });
    assert.equal(plan.runChecks, false);
    assert.equal(plan.runIntegration, false);
  });

  it('ignores the force options, which belong to manual runs', () => {
    const plan = decidePlan({ ...pullRequestIntoDevelop, forceBuild: true, forceInstall: true });
    assert.equal(plan.turboFlags, '--affected');
    assert.equal(plan.restoreDeps, true);
    assert.equal(plan.restoreBuild, true);
  });
});

describe('decidePlan for a push to develop', () => {
  const plan = decidePlan({ event: 'push', target: 'develop', changedPaths: ['README.md'] });

  it('verifies from scratch like the release tier', () => {
    assert.equal(plan.ok, true);
    assert.equal(plan.tier, 'strict');
    assert.equal(plan.turboFlags, '--force');
    assert.equal(plan.fetchDepth, 1);
    assert.equal(plan.runE2e, true);
    assert.equal(plan.runChecks, true);
    assert.equal(plan.runIntegration, true);
  });

  it('restores nothing but saves the caches pull requests restore', () => {
    assert.equal(plan.restoreDeps, false);
    assert.equal(plan.restoreBuild, false);
    assert.equal(plan.saveCache, true);
  });
});

describe('decidePlan for main', () => {
  it('runs the strict tier with no caches restored or saved', () => {
    for (const event of ['pull_request', 'push']) {
      const plan = decidePlan({ event, target: 'main', head: 'develop', changedPaths: codeChange });
      assert.equal(plan.tier, 'strict');
      assert.equal(plan.turboFlags, '--force');
      assert.equal(plan.runE2e, true);
      assert.equal(plan.restoreDeps, false);
      assert.equal(plan.restoreBuild, false);
      assert.equal(plan.saveCache, false);
    }
  });
});

describe('decidePlan for a manual run', () => {
  const manual = { event: 'workflow_dispatch', target: 'feat/some-feature' };

  it('tests touched packages only with caches restored by default', () => {
    const plan = decidePlan({ ...manual, changedPaths: ['frontend/storefront/a.ts'] });
    assert.equal(plan.tier, 'fast');
    assert.equal(plan.turboFlags, '--affected');
    assert.equal(plan.runChecks, true);
    assert.equal(plan.runIntegration, false);
    assert.equal(plan.runE2e, false);
    assert.equal(plan.restoreDeps, true);
    assert.equal(plan.restoreBuild, true);
  });

  it('runs everything when the changed paths are unknown', () => {
    const plan = decidePlan(manual);
    assert.equal(plan.runChecks, true);
    assert.equal(plan.runIntegration, true);
  });

  it('runs all packages when asked for the full tests', () => {
    const plan = decidePlan({ ...manual, changedPaths: ['docs/a.md'], fullTests: true });
    assert.equal(plan.turboFlags, '');
    assert.equal(plan.runChecks, true);
    assert.equal(plan.runIntegration, true);
    assert.equal(plan.restoreBuild, true);
  });

  it('ignores the full-tests option outside manual runs', () => {
    const plan = decidePlan({
      event: 'pull_request',
      target: 'develop',
      changedPaths: ['docs/a.md'],
      fullTests: true,
    });
    assert.equal(plan.runChecks, false);
    assert.equal(plan.turboFlags, '--affected');
  });

  it('runs everything on develop, where there is nothing to diff', () => {
    const plan = decidePlan({ event: 'workflow_dispatch', target: 'develop', changedPaths: [] });
    assert.equal(plan.runChecks, true);
    assert.equal(plan.turboFlags, '');
  });

  it('ignores the build caches and forces Turbo when asked to force the build', () => {
    const plan = decidePlan({
      ...manual,
      changedPaths: ['frontend/storefront/a.ts'],
      forceBuild: true,
    });
    assert.equal(plan.turboFlags, '--force --affected');
    assert.equal(plan.restoreBuild, false);
    assert.equal(plan.restoreDeps, true);
  });

  it('ignores the pnpm store alone when asked for a clean install', () => {
    const plan = decidePlan({ ...manual, forceInstall: true });
    assert.equal(plan.restoreDeps, false);
    assert.equal(plan.restoreBuild, true);
    assert.equal(plan.turboFlags, '--affected');
  });

  it('ignores every cache when both are forced', () => {
    const plan = decidePlan({ ...manual, forceBuild: true, forceInstall: true });
    assert.equal(plan.restoreDeps, false);
    assert.equal(plan.restoreBuild, false);
  });

  it('saves caches only when it runs on develop', () => {
    assert.equal(decidePlan(manual).saveCache, false);
    assert.equal(decidePlan({ ...manual, target: 'main' }).saveCache, false);
    assert.equal(decidePlan({ ...manual, target: 'develop' }).saveCache, true);
  });
});

describe('decidePlan tierReason', () => {
  it('explains why each kind of run got its tier', () => {
    assert.equal(
      decidePlan({ event: 'push', target: 'develop' }).tierReason,
      'push to develop: pre-production run from scratch',
    );
    assert.equal(
      decidePlan({ event: 'pull_request', target: 'main', head: 'develop' }).tierReason,
      'pull request into main: release path, everything runs from scratch',
    );
    assert.equal(
      decidePlan(pullRequestIntoDevelop).tierReason,
      'pull request into develop: affected packages with caches restored',
    );
    assert.equal(
      decidePlan({ event: 'workflow_dispatch', target: 'feat/some-feature' }).tierReason,
      'manual run: touched packages with caches restored unless forced',
    );
  });

  it('says so when no fast-tier branch pattern matches', () => {
    const { tier, tierReason } = decidePlan({ event: 'pull_request', target: 'other', head: 'x' });
    assert.equal(tier, 'strict');
    assert.match(tierReason, /no fast-tier branch pattern/);
  });
});

describe('decidePlan tier guard', () => {
  it('fails when a workflow expects the wrong tier', () => {
    assert.equal(decidePlan({ event: 'push', target: 'develop', expectedTier: 'fast' }).ok, false);
    assert.equal(decidePlan({ ...pullRequestIntoDevelop, expectedTier: 'strict' }).ok, false);
    assert.equal(
      decidePlan({ event: 'workflow_dispatch', target: 'x/y', expectedTier: 'strict' }).ok,
      false,
    );
  });

  it('passes when the triggers match the tier', () => {
    assert.equal(decidePlan({ event: 'push', target: 'develop', expectedTier: 'strict' }).ok, true);
    assert.equal(decidePlan({ ...pullRequestIntoDevelop, expectedTier: 'fast' }).ok, true);
    assert.equal(
      decidePlan({ event: 'workflow_dispatch', target: 'x/y', expectedTier: 'fast' }).ok,
      true,
    );
  });
});

describe('decideVerdict', () => {
  const passing = { plan: 'success', checks: 'success', build: 'success', integration: 'success' };

  it('fails a strict run whose E2E was skipped', () => {
    assert.equal(
      decideVerdict({ tier: 'strict', results: { ...passing, e2e: 'skipped' } }).ok,
      false,
    );
  });

  it('passes a strict run whose jobs all succeeded', () => {
    assert.equal(
      decideVerdict({ tier: 'strict', results: { ...passing, e2e: 'success' } }).ok,
      true,
    );
  });

  it('passes a fast run with E2E skipped', () => {
    assert.equal(decideVerdict({ tier: 'fast', results: { ...passing, e2e: 'skipped' } }).ok, true);
  });
});

describe('decideBranchName', () => {
  it('exempts the CI evidence branch', () => {
    assert.equal(decideBranchName({ head: 'ci-evidence' }).ok, true);
  });
});
