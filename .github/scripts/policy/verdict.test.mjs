// How CI / Gate judges the job results. Run with `node --test .github/scripts`.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decideVerdict } from './verdict.mjs';

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
