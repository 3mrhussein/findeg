import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('./cli.mjs', import.meta.url));

test('the plan CLI exports the E2E decision for workflow consumers', () => {
  const directory = mkdtempSync(join(tmpdir(), 'findeg-ci-plan-'));
  try {
    for (const [target, tier, expected] of [
      ['main', 'strict', 'true'],
      ['develop', 'fast', 'false'],
    ]) {
      const output = join(directory, target);
      const result = spawnSync(
        process.execPath,
        [cli, 'plan', '--event', 'pull_request', '--target', target, '--expect-tier', tier],
        { encoding: 'utf8', env: { ...process.env, GITHUB_OUTPUT: output } },
      );
      assert.equal(result.status, 0, result.stderr);
      assert.match(readFileSync(output, 'utf8'), new RegExp(`^run_e2e=${expected}$`, 'm'));
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('the verdict CLI rejects a skipped E2E result on strict but accepts it on fast', () => {
  const needs = JSON.stringify({ plan: { result: 'success' }, e2e: { result: 'skipped' } });
  for (const [tier, expectedStatus] of [
    ['strict', 1],
    ['fast', 0],
  ]) {
    const result = spawnSync(process.execPath, [cli, 'verdict', '--tier', tier, '--needs', needs], {
      encoding: 'utf8',
    });
    assert.equal(result.status, expectedStatus, result.stdout + result.stderr);
  }
});
