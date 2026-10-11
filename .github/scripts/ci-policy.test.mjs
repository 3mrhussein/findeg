// Behaviour of the CI plan and verdict decisions. Run with `node --test .github/scripts/ci-policy.test.mjs`.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PROMOTION_TITLE,
  buildPromotionBody,
  decideBranchName,
  decidePlan,
  decidePrTitle,
  decidePrTitleSuggestion,
  decidePromotion,
  decideVerdict,
  issueNumberFromBranch,
  prOpenUrl,
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

describe('decidePlan for a direct push to develop', () => {
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

describe('decidePlan for a push to develop that merges a pull request', () => {
  const merge = { event: 'push', target: 'develop', mergedHead: 'feat/add-x' };

  it('runs the fast tier on the touched packages, with caches restored and saved', () => {
    const plan = decidePlan({ ...merge, changedPaths: ['frontend/storefront/a.ts'] });
    assert.equal(plan.tier, 'fast');
    assert.equal(plan.turboFlags, '--affected');
    assert.equal(plan.runChecks, true);
    assert.equal(plan.runIntegration, false);
    assert.equal(plan.runE2e, false);
    assert.equal(plan.restoreDeps, true);
    assert.equal(plan.restoreBuild, true);
    assert.equal(plan.saveCache, true);
  });

  it('skips the code jobs for a docs-only merge', () => {
    assert.equal(decidePlan({ ...merge, changedPaths: ['README.md'] }).runChecks, false);
  });

  it('runs the full suite from scratch when the merge brings a hotfix', () => {
    for (const mergedHead of ['main', 'hotfix/stop-crash']) {
      const plan = decidePlan({ ...merge, mergedHead, changedPaths: ['README.md'] });
      assert.equal(plan.tier, 'strict');
      assert.equal(plan.turboFlags, '--force');
      assert.equal(plan.runChecks, true);
      assert.equal(plan.runE2e, true);
    }
  });

  it('ignores the merged PR everywhere but develop pushes', () => {
    const plan = decidePlan({ event: 'push', target: 'main', mergedHead: 'feat/add-x' });
    assert.equal(plan.tier, 'strict');
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

  it('runs everything on all packages when the changed paths are unknown', () => {
    const plan = decidePlan(manual);
    assert.equal(plan.turboFlags, '');
    assert.equal(plan.runChecks, true);
    assert.equal(plan.runIntegration, true);
  });

  it('runs the full suite, E2E included, when asked for the full tests', () => {
    const plan = decidePlan({ ...manual, changedPaths: ['docs/a.md'], fullTests: true });
    assert.equal(plan.turboFlags, '');
    assert.equal(plan.runChecks, true);
    assert.equal(plan.runIntegration, true);
    assert.equal(plan.runE2e, true);
    assert.equal(plan.tierReason, 'manual run: full suite (every package and E2E)');
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

  it('tests only the touched packages on develop too', () => {
    const plan = decidePlan({
      event: 'workflow_dispatch',
      target: 'develop',
      changedPaths: ['frontend/storefront/a.ts'],
    });
    assert.equal(plan.turboFlags, '--affected');
    assert.equal(plan.runIntegration, false);
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
    const plan = decidePlan({
      ...manual,
      changedPaths: ['frontend/storefront/a.ts'],
      forceInstall: true,
    });
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
      'push to develop: direct push (no merged pull request), run from scratch',
    );
    assert.equal(
      decidePlan({ event: 'push', target: 'develop', mergedHead: 'feat/x' }).tierReason,
      'push to develop: merged pull request, touched packages with caches restored',
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

  it('replaces an existing override that does not fit the new title', () => {
    const body = 'Hi\n<!--\nBEGIN_COMMIT_OVERRIDE\ndocs: old words\nEND_COMMIT_OVERRIDE\n-->';
    const plan = decidePrTitleSuggestion({ head: 'feat/add-x', body });
    assert.equal(
      plan.body,
      'Hi\n<!--\nBEGIN_COMMIT_OVERRIDE\nfeat: add x\nEND_COMMIT_OVERRIDE\n-->',
    );
    assert.equal(decidePrTitle(plan).ok, true);
  });

  it('keeps an existing override that fits the new title', () => {
    const body = '<!--\nBEGIN_COMMIT_OVERRIDE\nfeat(ci)!: add x\nEND_COMMIT_OVERRIDE\n-->';
    assert.equal(decidePrTitleSuggestion({ head: 'feat/add-x', body }).body, body);
  });

  it('keeps a pipe title the PR was opened with and builds the override from it', () => {
    const plan = decidePrTitleSuggestion({
      head: 'feat/add-x',
      currentTitle: 'Feature | #9 | Add the big X',
    });
    assert.equal(plan.title, 'Feature | #9 | Add the big X');
    assert.match(plan.body, /\nfeat: add the big X\n/);
    assert.equal(decidePrTitle(plan).ok, true);
  });

  it('replaces a title that is not in the pipe format', () => {
    const plan = decidePrTitleSuggestion({ head: 'feat/add-x', currentTitle: 'Feat/add x' });
    assert.equal(plan.title, 'Feature | Add x');
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
    assert.equal(
      decidePrTitle({ title: 'Feature | Add dispatch button', base: 'develop' }).ok,
      false,
    );
  });

  it('needs no override on a PR into main, which merges with a merge commit', () => {
    assert.equal(decidePrTitle({ title: 'CI | Fix pipeline issues', base: 'main' }).ok, true);
    assert.equal(decidePrTitle({ title: 'not a valid title', base: 'main' }).ok, false);
  });

  it('rejects an override whose subject no longer matches the title', () => {
    assert.equal(decidePrTitle({ title: 'Feature | Remove dispatch button', body }).ok, false);
  });

  it('accepts a scoped or breaking override, and CRLF bodies', () => {
    const scoped = body.replace('feat:', 'feat(ci)!:').replaceAll('\n', '\r\n');
    assert.equal(decidePrTitle({ title: 'Feature | Add dispatch button', body: scoped }).ok, true);
  });

  it('accepts plain Conventional Commits for tooling PRs', () => {
    assert.equal(decidePrTitle({ title: 'chore(deps): bump x' }).ok, true);
    assert.equal(decidePrTitle({ title: 'Add dispatch button' }).ok, false);
  });
});

describe('prOpenUrl', () => {
  it('links to the new-PR form into develop with the title filled in', () => {
    assert.equal(
      prOpenUrl({
        repoUrl: 'git@github.com:acme/shop.git',
        head: 'feat/122-add-x',
        title: 'Feature | #122 | Add x',
      }),
      'https://github.com/acme/shop/compare/develop...feat/122-add-x?quick_pull=1&title=Feature%20%7C%20%23122%20%7C%20Add%20x',
    );
  });

  it('turns ssh:// remotes into https links', () => {
    const url = prOpenUrl({
      repoUrl: 'ssh://git@github.com:22/acme/shop.git',
      head: 'feat/x',
      title: 'T',
    });
    assert.match(url, /^https:\/\/github\.com\/acme\/shop\/compare\//);
  });

  it('sends hotfixes to main', () => {
    const url = prOpenUrl({
      repoUrl: 'https://github.com/acme/shop',
      head: 'hotfix/x',
      title: 'T',
    });
    assert.match(url, /\/compare\/main\.\.\.hotfix\/x\?/);
  });
});

describe('decidePromotion', () => {
  const green = { status: 'completed', gate: 'success', url: 'https://example.test/run/1' };
  const ready = {
    ref: 'develop',
    headSha: 'abcdef1234567890',
    developTip: 'abcdef1234567890',
    ciRun: green,
    aheadBy: 3,
  };

  it('promotes develop when its push CI passed the gate and it is ahead of main', () => {
    const decision = decidePromotion(ready);
    assert.equal(decision.ok, true);
    assert.equal(decision.promote, true);
    assert.equal(decision.title, 'Chore | Promote develop to main');
  });

  it('refuses to run from any other branch', () => {
    const decision = decidePromotion({ ...ready, ref: 'feat/x' });
    assert.equal(decision.ok, false);
    assert.match(decision.reason, /from develop/);
  });

  it('refuses while develop has no CI run, or it is still going', () => {
    assert.equal(decidePromotion({ ...ready, ciRun: undefined }).ok, false);
    const running = decidePromotion({ ...ready, ciRun: { status: 'in_progress' } });
    assert.equal(running.ok, false);
    assert.match(running.reason, /still in_progress/);
  });

  it('refuses when the gate failed, was cancelled or did not report', () => {
    for (const gate of ['failure', 'cancelled', '', undefined]) {
      const decision = decidePromotion({ ...ready, ciRun: { status: 'completed', gate } });
      assert.equal(decision.ok, false, `gate ${gate}`);
    }
  });

  it('refuses when develop moved past the commit whose CI was checked', () => {
    const decision = decidePromotion({ ...ready, developTip: '9999999999999999' });
    assert.equal(decision.ok, false);
    assert.match(decision.reason, /moved from abcdef12 to 99999999/);
    assert.equal(decidePromotion({ ...ready, developTip: undefined }).ok, false);
  });

  it('opens nothing when main already has every develop commit', () => {
    const decision = decidePromotion({ ...ready, aheadBy: 0 });
    assert.equal(decision.ok, true);
    assert.equal(decision.promote, false);
  });

  it('gives a title the PR title check accepts on a PR into main', () => {
    assert.equal(decidePrTitle({ title: PROMOTION_TITLE, body: '', base: 'main' }).ok, true);
  });
});

describe('buildPromotionBody', () => {
  it('lists the squash commits and leaves merge commits out', () => {
    const body = buildPromotionBody({
      headSha: 'abcdef1234567890',
      ciRunUrl: 'https://example.test/run/1',
      commits: [
        { subject: 'Feature | #12 | Add x', parents: 1 },
        { subject: 'Merge pull request #9 from acme/main', parents: 2 },
        { subject: 'fix: y', parents: 1 },
      ],
    });
    assert.match(body, /- Feature \| #12 \| Add x\n- fix: y\n/);
    assert.doesNotMatch(body, /Merge pull request/);
    assert.match(body, /`abcdef12` \(\[run\]\(https:\/\/example\.test\/run\/1\)\)/);
    assert.match(body, /merge commit, never squash/);
  });

  it('caps a long list', () => {
    const commits = Array.from({ length: 60 }, (_, i) => ({ subject: `fix: ${i}`, parents: 1 }));
    assert.match(buildPromotionBody({ headSha: 'a', commits }), /…and 10 more/);
  });
});

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
      build: 'success',
      integration: 'success',
      e2e: 'success',
    };
    for (const job of ['checks', 'build', 'integration', 'e2e']) {
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
});
