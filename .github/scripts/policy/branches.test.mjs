// Branch naming rules and which branches may open a PR into main (ADR-0002, ADR-0015).
// Run with `node --test .github/scripts`.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decideBranchName, decideReleaseSource } from './branches.mjs';

describe('decideBranchName', () => {
  it('exempts the CI evidence branch', () => {
    assert.equal(decideBranchName({ head: 'ci-evidence' }).ok, true);
  });

  it('accepts <type>/<kebab-case-slug> and rejects other names', () => {
    assert.equal(decideBranchName({ head: 'feat/add-x' }).ok, true);
    assert.equal(decideBranchName({ head: 'feat/Add_X' }).ok, false);
    assert.equal(decideBranchName({ head: 'wip/add-x' }).ok, false);
  });

  it('lets hotfix branches target main only', () => {
    assert.equal(decideBranchName({ head: 'hotfix/x', base: 'main' }).ok, true);
    assert.equal(decideBranchName({ head: 'hotfix/x', base: 'develop' }).ok, false);
  });
});

describe('decideReleaseSource', () => {
  it('lets only develop, hotfix/* and the release bot open a PR into main', () => {
    for (const head of ['develop', 'hotfix/x', 'release-please--branches--main']) {
      assert.equal(decideReleaseSource({ head, base: 'main' }).ok, true, head);
    }
    for (const head of ['feat/x', 'fix/x', 'chore/x', 'ci/x', 'main', 'dependabot/npm/x']) {
      assert.equal(decideReleaseSource({ head, base: 'main' }).ok, false, head);
    }
  });

  it('places no source restriction on PRs into develop', () => {
    assert.equal(decideReleaseSource({ head: 'feat/x', base: 'develop' }).ok, true);
  });
});
