// Run with: node --test scripts/worktree.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const worktreeScript = resolve(here, 'worktree.mjs');

test('worktree.mjs displays help text when invoked with no arguments', () => {
  const output = execFileSync('node', [worktreeScript], { encoding: 'utf8' });
  assert.match(output, /FindEg Worktree Management CLI/);
  assert.match(output, /create/);
  assert.match(output, /remove/);
  assert.match(output, /prune/);
  assert.match(output, /list/);
});

test('worktree.mjs rejects branch names that violate the naming convention', () => {
  const invalidNames = [
    'bad-branch',
    'feat/',
    'feat_snake_case',
    'random/feature',
    'FEATURE/upper',
  ];

  for (const branch of invalidNames) {
    assert.throws(
      () => {
        execFileSync('node', [worktreeScript, 'create', branch], {
          encoding: 'utf8',
          stdio: 'pipe',
        });
      },
      (err) => {
        assert.match(err.stderr || err.stdout, /Invalid branch name/);
        return true;
      },
    );
  }
});

test('worktree.mjs lists active worktrees without errors', () => {
  const output = execFileSync('node', [worktreeScript, 'list'], { encoding: 'utf8' });
  assert.match(output, /Active Git Worktrees:/);
  assert.match(output, /develop/);
  assert.match(output, /\[ROOT\]/);
});
