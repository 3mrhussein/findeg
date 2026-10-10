// Behaviour of the CI plan and verdict decisions. Run with `node --test .github/scripts/ci-policy.test.mjs`.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  decideBranchName,
  decidePlan,
  decidePrTitle,
  decidePrTitleSuggestion,
  decideVerdict,
  issueNumberFromBranch,
} from './ci-policy.mjs';

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

describe('decidePrTitleSuggestion', () => {
  it('builds the title from the branch slug', () => {
    const plan = decidePrTitleSuggestion({ head: 'feat/add-dispatch-button' });
    assert.equal(plan.title, 'Feature | Add dispatch button');
    assert.match(
      plan.body,
      /BEGIN_COMMIT_OVERRIDE\nfeat: add dispatch button\nEND_COMMIT_OVERRIDE/,
    );
  });

  it('adds the issue number a branch names and prefers the issue title', () => {
    const plan = decidePrTitleSuggestion({
      head: 'ci/122-dispatch-button',
      issueTitle: 'Add dispatch button',
    });
    assert.equal(plan.title, 'CI | #122 | Add dispatch button');
    assert.equal(issueNumberFromBranch('ci/122-dispatch-button'), 122);
    assert.equal(issueNumberFromBranch('ci/dispatch-button'), undefined);
  });

  it('falls back to the commit subject, without its conventional prefix', () => {
    const plan = decidePrTitleSuggestion({
      head: 'docs/notes',
      commitSubject: 'docs(ci): explain the cache tiers',
    });
    assert.equal(plan.title, 'Doc | Explain the cache tiers');
  });

  it('maps hotfix branches to a Fix commit', () => {
    const plan = decidePrTitleSuggestion({ head: 'hotfix/stop-crash' });
    assert.equal(plan.title, 'Hotfix | Stop crash');
    assert.match(plan.body, /\nfix: stop crash\n/);
  });

  it('keeps the body and does not add a second override', () => {
    const first = decidePrTitleSuggestion({ head: 'feat/a-b', body: '## Description\nHi' });
    assert.match(first.body, /^## Description\nHi\n\n<!--/);
    assert.equal(decidePrTitleSuggestion({ head: 'feat/a-b', body: first.body }).body, first.body);
  });

  it('refuses branches without a type and slug', () => {
    assert.equal(decidePrTitleSuggestion({ head: 'develop' }).ok, false);
    assert.equal(decidePrTitleSuggestion({ head: 'dependabot/npm/x' }).ok, false);
  });
});

describe('decidePrTitle', () => {
  const body = '<!--\nBEGIN_COMMIT_OVERRIDE\nfeat: add dispatch button\nEND_COMMIT_OVERRIDE\n-->';

  it('accepts the pipe format with a matching override', () => {
    assert.equal(decidePrTitle({ title: 'Feature | #122 | Add dispatch button', body }).ok, true);
    assert.equal(decidePrTitle({ title: 'Feature | Add dispatch button', body }).ok, true);
  });

  it('rejects a pipe title without a matching override', () => {
    assert.equal(decidePrTitle({ title: 'Feature | Add dispatch button' }).ok, false);
    assert.equal(decidePrTitle({ title: 'Fix | Add dispatch button', body }).ok, false);
  });

  it('accepts plain Conventional Commits for tooling PRs', () => {
    assert.equal(decidePrTitle({ title: 'chore(deps): bump x' }).ok, true);
    assert.equal(decidePrTitle({ title: 'Add dispatch button' }).ok, false);
  });
});
