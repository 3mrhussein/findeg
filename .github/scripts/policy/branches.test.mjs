// Branch naming rules. Run with `node --test .github/scripts`.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decideBranchName } from './branches.mjs';

describe('decideBranchName', () => {
  it('exempts the CI evidence branch', () => {
    assert.equal(decideBranchName({ head: 'ci-evidence' }).ok, true);
  });
});
