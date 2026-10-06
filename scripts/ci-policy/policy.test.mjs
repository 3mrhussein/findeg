// Run with: node --test scripts/ci-policy/policy.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decideBranchName, decidePlan, decideReleaseSource, decideVerdict } from './policy.mjs';

test('a <type>/<kebab-case-slug> branch is accepted for every Conventional Commits type', () => {
  for (const type of [
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'perf',
    'test',
    'build',
    'ci',
    'chore',
    'revert',
  ]) {
    const decision = decideBranchName({ head: `${type}/some-task-2`, base: 'develop' });
    assert.equal(decision.ok, true, `${type}/some-task-2 should be accepted`);
    assert.equal(typeof decision.reason, 'string');
  }
});

test('a hotfix/<slug> branch is accepted for a PR into main', () => {
  assert.equal(decideBranchName({ head: 'hotfix/broken-checkout', base: 'main' }).ok, true);
});

test('a hotfix/<slug> branch is rejected for a PR into develop, with a reason naming main', () => {
  const decision = decideBranchName({ head: 'hotfix/broken-checkout', base: 'develop' });
  assert.equal(decision.ok, false);
  assert.match(decision.reason, /main/);
});

test('a hotfix/<slug> branch is accepted when the base is not known yet (a push before any PR)', () => {
  assert.equal(decideBranchName({ head: 'hotfix/broken-checkout' }).ok, true);
});

test('malformed branch names are rejected with a reason showing the expected shape', () => {
  for (const head of [
    'feature/some-task', // not a Conventional Commits type
    'Feat/some-task',
    'feat/Some-Task',
    'feat/some_task',
    'feat/some-task-',
    'feat/-some-task',
    'feat/some--task',
    'feat/',
    'feat/some/task',
    'some-task',
    '011-dashboard-read-to-db',
    'hotfix/Broken_checkout',
  ]) {
    const decision = decideBranchName({ head, base: 'main' });
    assert.equal(decision.ok, false, `${head} should be rejected`);
    assert.match(decision.reason, /<type>\/<kebab-case-slug>/);
  }
});

test('long-lived and tooling branches are exempt from <type>/<slug>', () => {
  for (const [head, base] of [
    ['main', 'develop'],
    ['develop', 'main'],
    ['release-please--branches--main', 'main'],
    ['dependabot/npm_and_yarn/develop/next-16.3.1', 'develop'],
    ['dependabot/github_actions/actions/checkout-7', 'develop'],
    ['worktree-setup-matt-pocock-skills', 'develop'],
  ]) {
    const decision = decideBranchName({ head, base });
    assert.equal(decision.ok, true, `${head} should be exempt`);
    assert.match(decision.reason, /exempt/);
  }
});

test('a PR into main is accepted from develop, hotfix/* and release-please--*', () => {
  for (const head of ['develop', 'hotfix/broken-checkout', 'release-please--branches--main']) {
    assert.equal(decideReleaseSource({ head, base: 'main' }).ok, true, `${head} into main`);
  }
});

test('a PR into main from any other branch is rejected, with a reason naming the allowed sources', () => {
  for (const head of ['feat/new-cart', 'fix/typo', 'dependabot/npm_and_yarn/next-16.3.1']) {
    const decision = decideReleaseSource({ head, base: 'main' });
    assert.equal(decision.ok, false, `${head} into main should be rejected`);
    assert.match(decision.reason, /develop/);
    assert.match(decision.reason, /hotfix/);
  }
});

test('the release-source rule does not restrict PRs into other branches', () => {
  assert.equal(decideReleaseSource({ head: 'feat/new-cart', base: 'develop' }).ok, true);
  assert.equal(decideReleaseSource({ head: 'feat/new-cart', base: 'feat/big-epic' }).ok, true);
});

test('the release-source rule is skipped, saying so, when the base is not known yet (a push before any PR)', () => {
  const decision = decideReleaseSource({ head: 'feat/new-cart' });
  assert.equal(decision.ok, true);
  assert.match(decision.reason, /skipped/i);
});

// --- CI plan: tier, caches, which jobs run ---

const BACKEND_ONLY = ['backend/src/orders/service.ts'];

test('changes landing on main (PR into main, push to main) run the strict tier', () => {
  for (const event of ['pull_request', 'push']) {
    const plan = decidePlan({ event, target: 'main', changedPaths: BACKEND_ONLY });
    assert.equal(plan.tier, 'strict', `${event} to main`);
  }
});

test('changes landing on develop (PR into develop, push to develop) run the fast tier', () => {
  for (const event of ['pull_request', 'push']) {
    const plan = decidePlan({ event, target: 'develop', changedPaths: BACKEND_ONLY });
    assert.equal(plan.tier, 'fast', `${event} to develop`);
  }
});

// The tier guard: each CI workflow states the tier it expects (CI → fast,
// CI · Release → strict), so a mis-set trigger fails the plan instead of
// running the wrong tier.

test('the plan passes when the workflow expects the tier the target gets', () => {
  const cases = [
    // [event, target, expectedTier]
    ['pull_request', 'develop', 'fast'],
    ['push', 'develop', 'fast'],
    ['pull_request', 'main', 'strict'],
    ['push', 'main', 'strict'],
  ];
  for (const [event, target, expectedTier] of cases) {
    const plan = decidePlan({ event, target, expectedTier, changedPaths: BACKEND_ONLY });
    assert.equal(plan.ok, true, `${event} to ${target}, expecting ${expectedTier}`);
  }
});

test('the plan fails, naming both tiers, when the workflow expects a different tier', () => {
  const cases = [
    // [event, target, expectedTier, computedTier]
    ['pull_request', 'develop', 'strict', 'fast'],
    ['push', 'develop', 'strict', 'fast'],
    ['pull_request', 'main', 'fast', 'strict'],
    ['push', 'main', 'fast', 'strict'],
  ];
  for (const [event, target, expectedTier, computedTier] of cases) {
    const plan = decidePlan({ event, target, expectedTier, changedPaths: BACKEND_ONLY });
    const label = `${event} to ${target}, expecting ${expectedTier}`;
    assert.equal(plan.ok, false, label);
    assert.match(plan.reason, new RegExp(expectedTier), label);
    assert.match(plan.reason, new RegExp(computedTier), label);
    assert.match(plan.reason, new RegExp(target), label);
  }
});

test('the plan fails when the workflow does not state the tier it expects', () => {
  for (const target of ['develop', 'main']) {
    const plan = decidePlan({ event: 'push', target, changedPaths: BACKEND_ONLY });
    assert.equal(plan.ok, false, target);
    assert.doesNotMatch(plan.reason, /undefined/, target);
  }
});

test('only the fast tier restores caches, and only a push to develop saves them', () => {
  const cases = [
    // [event, target, useCache, saveCache]
    ['pull_request', 'develop', true, false],
    ['push', 'develop', true, true],
    ['pull_request', 'main', false, false],
    ['push', 'main', false, false],
  ];
  for (const [event, target, useCache, saveCache] of cases) {
    const plan = decidePlan({ event, target, changedPaths: BACKEND_ONLY });
    assert.equal(plan.useCache, useCache, `${event} to ${target}: useCache`);
    assert.equal(plan.saveCache, saveCache, `${event} to ${target}: saveCache`);
  }
});

test('the fast tier runs Turbo on affected packages over full history; strict forces every task on a shallow clone', () => {
  const cases = [
    // [event, target, turboFlags, fetchDepth]
    ['pull_request', 'develop', '--affected', 0],
    ['push', 'develop', '--affected', 0],
    ['pull_request', 'main', '--force', 1],
    ['push', 'main', '--force', 1],
  ];
  for (const [event, target, turboFlags, fetchDepth] of cases) {
    const plan = decidePlan({ event, target, changedPaths: BACKEND_ONLY });
    assert.equal(plan.turboFlags, turboFlags, `${event} to ${target}: turboFlags`);
    assert.equal(plan.fetchDepth, fetchDepth, `${event} to ${target}: fetchDepth`);
  }
});

const FRONTEND_ONLY = ['frontend/storefront/src/app/page.tsx', 'frontend/ui/src/button.tsx'];
const DOCS_ONLY = ['docs/adr/0014-develop-branch-flow.md', 'README.md'];

test('on the fast tier, integration tests run when the backend, db, env package, root tooling or CI policy changed', () => {
  for (const changedPaths of [
    BACKEND_ONLY,
    ['db/schema/orders.ts'],
    ['packages/env/src/core.ts'],
    ['pnpm-lock.yaml'],
    ['package.json'],
    ['turbo.json'],
    ['.nvmrc'],
    ['docker-compose.yml'],
    ['scripts/ci-policy/policy.mjs'],
    ['.github/workflows/ci.yml'],
    ['.github/workflows/ci-jobs.yml'],
    ['.github/workflows/ci-release.yml'],
    ['.github/actions/setup/action.yml'],
    ['README.md', 'backend/package.json'],
  ]) {
    for (const event of ['pull_request', 'push']) {
      const plan = decidePlan({ event, target: 'develop', changedPaths });
      assert.equal(plan.runIntegration, true, `${event}: ${changedPaths.join(', ')}`);
    }
  }
});

test('on the fast tier, frontend-only and docs-only changes skip integration tests', () => {
  for (const changedPaths of [FRONTEND_ONLY, DOCS_ONLY]) {
    for (const event of ['pull_request', 'push']) {
      const plan = decidePlan({ event, target: 'develop', changedPaths });
      assert.equal(plan.runIntegration, false, `${event}: ${changedPaths.join(', ')}`);
    }
  }
});

test('on the strict tier, integration tests always run, whatever changed', () => {
  for (const changedPaths of [BACKEND_ONLY, FRONTEND_ONLY, DOCS_ONLY, ['pnpm-lock.yaml']]) {
    for (const event of ['pull_request', 'push']) {
      const plan = decidePlan({ event, target: 'main', changedPaths });
      assert.equal(plan.runIntegration, true, `${event}: ${changedPaths.join(', ')}`);
    }
  }
});

test('when the changed paths are unknown, the fast tier runs integration tests to be safe', () => {
  const plan = decidePlan({ event: 'push', target: 'develop', changedPaths: undefined });
  assert.equal(plan.runIntegration, true);
});

test('on the fast tier, docs-only, agent-tooling and other-workflow changes skip the code checks', () => {
  for (const changedPaths of [
    DOCS_ONLY,
    ['frontend/dashboard/README.md', '.github/PULL_REQUEST_TEMPLATE.md'],
    ['.github/workflows/bot-claude-review.yml', '.github/workflows/pr-conventions.yml'],
    [
      '.claude/skills/tdd/SKILL.md',
      '.agents/skills/pr/agents/openai.yaml',
      '.agent/workflows/new-page.md',
    ],
  ]) {
    for (const event of ['pull_request', 'push']) {
      const plan = decidePlan({ event, target: 'develop', changedPaths });
      assert.equal(plan.runChecks, false, `${event}: ${changedPaths.join(', ')}`);
    }
  }
});

test('on the fast tier, any code, config or CI change runs the code checks', () => {
  for (const changedPaths of [
    BACKEND_ONLY,
    FRONTEND_ONLY,
    ['pnpm-lock.yaml'],
    ['turbo.json'],
    ['.prettierrc'],
    ['scripts/ci-policy/policy.mjs'],
    ['.github/workflows/ci.yml'],
    ['.github/workflows/ci-jobs.yml'],
    ['.github/workflows/ci-release.yml'],
    ['.github/actions/setup/action.yml'],
    ['README.md', 'frontend/ui/src/button.tsx'],
  ]) {
    const plan = decidePlan({ event: 'pull_request', target: 'develop', changedPaths });
    assert.equal(plan.runChecks, true, changedPaths.join(', '));
  }
  const unknown = decidePlan({ event: 'push', target: 'develop', changedPaths: undefined });
  assert.equal(unknown.runChecks, true, 'unknown changed paths');
});

// --- CI OK verdict ---

// CI OK's needs, by job id. `checks` is the Lint / Type check / Unit tests
// matrix, whose result is a failure when any leg failed.
const ALL_PASSED = {
  plan: 'success',
  checks: 'success',
  build: 'success',
  integration: 'success',
};

test('CI OK passes when every job passed, on either tier', () => {
  for (const tier of ['fast', 'strict']) {
    const verdict = decideVerdict({ tier, results: ALL_PASSED });
    assert.equal(verdict.ok, true, tier);
    assert.equal(typeof verdict.reason, 'string');
  }
});

test('CI OK fails when a job failed or was cancelled, naming the job', () => {
  for (const tier of ['fast', 'strict']) {
    for (const result of ['failure', 'cancelled']) {
      const verdict = decideVerdict({ tier, results: { ...ALL_PASSED, checks: result } });
      assert.equal(verdict.ok, false, `${tier}: checks ${result}`);
      assert.match(verdict.reason, /checks/);
      assert.match(verdict.reason, new RegExp(result));
    }
  }
});

test('CI OK fails when the plan itself failed, even though everything after it was skipped', () => {
  const results = Object.fromEntries(Object.keys(ALL_PASSED).map((job) => [job, 'skipped']));
  const verdict = decideVerdict({ tier: undefined, results: { ...results, plan: 'failure' } });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reason, /plan/);
});

test('CI OK passes on the fast tier when irrelevant jobs were skipped', () => {
  const docsOnly = {
    ...ALL_PASSED,
    checks: 'skipped',
    build: 'skipped',
    integration: 'skipped',
  };
  assert.equal(decideVerdict({ tier: 'fast', results: docsOnly }).ok, true);
  const frontendOnly = { ...ALL_PASSED, integration: 'skipped' };
  assert.equal(decideVerdict({ tier: 'fast', results: frontendOnly }).ok, true);
});

test('CI OK fails on an unrecognised job result rather than letting it through', () => {
  const verdict = decideVerdict({ tier: 'fast', results: { ...ALL_PASSED, build: '' } });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reason, /build/);
});

test('on the strict tier, the code checks always run, even for docs-only changes', () => {
  for (const event of ['pull_request', 'push']) {
    assert.equal(decidePlan({ event, target: 'main', changedPaths: DOCS_ONLY }).runChecks, true);
  }
});
