import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

for (const [target, tier, expected] of [
  ['main', 'strict', 'true'],
  ['develop', 'fast', 'false'],
]) {
  test(`the ${tier} CLI plan exports its E2E decision even for docs-only changes`, () => {
    const directory = mkdtempSync(join(tmpdir(), 'findeg-ci-plan-'));
    try {
      const output = join(directory, 'output');
      const changedFiles = join(directory, 'changes');
      writeFileSync(output, 'existing_output=preserved\n');
      writeFileSync(changedFiles, 'README.md\ndocs/operations/releases.md\n');
      const result = spawnSync(
        process.execPath,
        [
          cli,
          'plan',
          '--event',
          'pull_request',
          '--target',
          target,
          '--expect-tier',
          tier,
          '--changed-files',
          changedFiles,
        ],
        { encoding: 'utf8', timeout: 10000, env: { ...process.env, GITHUB_OUTPUT: output } },
      );

      assert.equal(result.status, 0, result.stdout + result.stderr);
      const outputs = readFileSync(output, 'utf8');
      assert.match(outputs, /^existing_output=preserved$/m);
      assert.match(outputs, new RegExp(`^run_e2e=${expected}$`, 'm'));
      assert.match(outputs, new RegExp(`^run_checks=${expected}$`, 'm'));
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
}

test('a rejected tier does not publish a usable E2E decision', () => {
  const directory = mkdtempSync(join(tmpdir(), 'findeg-ci-plan-'));
  try {
    const output = join(directory, 'output');
    writeFileSync(output, 'existing_output=preserved\n');
    const result = spawnSync(
      process.execPath,
      [cli, 'plan', '--event', 'pull_request', '--target', 'main', '--expect-tier', 'fast'],
      { encoding: 'utf8', timeout: 10000, env: { ...process.env, GITHUB_OUTPUT: output } },
    );
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.equal(readFileSync(output, 'utf8'), 'existing_output=preserved\n');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('the strict verdict CLI rejects absent E2E results and accepts successful E2E', () => {
  for (const [e2e, status] of [
    [undefined, 1],
    [{ result: 'success' }, 0],
  ]) {
    const needs = JSON.stringify({ plan: { result: 'success' }, e2e });
    const result = spawnSync(
      process.execPath,
      [cli, 'verdict', '--tier', 'strict', '--needs', needs],
      {
        encoding: 'utf8',
        timeout: 10000,
      },
    );
    assert.equal(result.status, status, result.stdout + result.stderr);
  }
});
