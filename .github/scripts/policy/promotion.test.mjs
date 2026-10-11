// When the Promote to main button may open the release PR. Run with `node --test .github/scripts`.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PROMOTION_TITLE, buildPromotionBody, decidePromotion } from './promotion.mjs';
import { decidePrTitle } from './pr-title.mjs';

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
