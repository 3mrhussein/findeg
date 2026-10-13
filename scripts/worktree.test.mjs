// Run with: node --test scripts/worktree.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const worktreeScript = resolve(here, 'worktree.mjs');

function createGitFixture() {
  const fixtureDir = mkdtempSync(join(tmpdir(), 'wt-fixture-'));
  execFileSync('git', ['init', '-b', 'develop', fixtureDir]);
  execFileSync('git', ['-C', fixtureDir, 'config', 'user.email', 'test@test.local']);
  execFileSync('git', ['-C', fixtureDir, 'config', 'user.name', 'Test']);
  execFileSync('git', ['-C', fixtureDir, 'commit', '--allow-empty', '-m', 'initial']);
  execFileSync('git', ['-C', fixtureDir, 'remote', 'add', 'origin', fixtureDir]);
  execFileSync('git', ['-C', fixtureDir, 'fetch', 'origin', 'develop']);
  return fixtureDir;
}

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

test('worktree.mjs lists active worktrees without errors using fixture repo', () => {
  const fixtureDir = createGitFixture();
  try {
    const output = execFileSync('node', [worktreeScript, 'list'], {
      cwd: fixtureDir,
      encoding: 'utf8',
    });
    assert.match(output, /Active Git Worktrees:/);
    assert.match(output, /develop/);
    assert.match(output, /\[ROOT\]/);
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test('worktree.mjs does not classify newly created branch as [MERGED]', () => {
  const fixtureDir = createGitFixture();
  try {
    // Create a new worktree off origin/develop
    execFileSync('node', [worktreeScript, 'create', 'feat/test-branch'], {
      cwd: fixtureDir,
      encoding: 'utf8',
    });

    const output = execFileSync('node', [worktreeScript, 'list'], {
      cwd: fixtureDir,
      encoding: 'utf8',
    });
    assert.match(output, /feat\/test-branch/);
    assert.doesNotMatch(output, /feat\/test-branch.*\[MERGED\]/);
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test('worktree.mjs refuses to remove unregistered directory outside worktree containers', () => {
  const fixtureDir = createGitFixture();
  try {
    assert.throws(
      () => {
        execFileSync('node', [worktreeScript, 'remove', fixtureDir], {
          cwd: fixtureDir,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      },
      (err) => {
        assert.match(err.stderr || err.stdout, /Cannot remove the root workspace repository/);
        return true;
      },
    );

    const outsideDir = mkdtempSync(join(tmpdir(), 'outside-'));
    try {
      assert.throws(
        () => {
          execFileSync('node', [worktreeScript, 'remove', outsideDir], {
            cwd: fixtureDir,
            encoding: 'utf8',
            stdio: 'pipe',
          });
        },
        (err) => {
          assert.match(
            err.stderr || err.stdout,
            /Refusing to remove directory outside worktree containers/,
          );
          return true;
        },
      );
    } finally {
      rmSync(outsideDir, { recursive: true, force: true });
    }
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test('worktree.mjs refuses to remove dirty worktree without --force', () => {
  const fixtureDir = createGitFixture();
  try {
    execFileSync('node', [worktreeScript, 'create', 'feat/dirty-test'], {
      cwd: fixtureDir,
      encoding: 'utf8',
    });

    const wtPath = resolve(fixtureDir, 'worktree', 'feat/dirty-test');
    // Dirty the worktree
    writeFileSync(resolve(wtPath, 'dirty.txt'), 'uncommitted changes');

    assert.throws(
      () => {
        execFileSync('node', [worktreeScript, 'remove', 'feat/dirty-test'], {
          cwd: fixtureDir,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      },
      (err) => {
        assert.match(err.stderr || err.stdout, /has uncommitted changes.*Use --force/);
        return true;
      },
    );

    // With --force it should succeed
    const output = execFileSync('node', [worktreeScript, 'remove', 'feat/dirty-test', '--force'], {
      cwd: fixtureDir,
      encoding: 'utf8',
    });
    assert.match(output, /Removed worktree/);
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test('worktree.mjs refuses to remove locked worktree when git refuses', () => {
  const fixtureDir = createGitFixture();
  try {
    execFileSync('node', [worktreeScript, 'create', 'feat/locked-test'], {
      cwd: fixtureDir,
      encoding: 'utf8',
    });

    const wtPath = resolve(fixtureDir, 'worktree', 'feat/locked-test');
    // Lock the worktree
    execFileSync('git', ['worktree', 'lock', wtPath], { cwd: fixtureDir });

    assert.throws(
      () => {
        execFileSync('node', [worktreeScript, 'remove', 'feat/locked-test'], {
          cwd: fixtureDir,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      },
      (err) => {
        assert.match(err.stderr || err.stdout, /Git refused to remove worktree/);
        return true;
      },
    );

    // The worktree directory must still exist!
    assert.strictEqual(existsSync(wtPath), true);
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test('worktree.mjs refuses fallback removal when target overlaps a registered worktree', () => {
  const fixtureDir = createGitFixture();
  try {
    execFileSync('node', [worktreeScript, 'create', 'feat/nested-test'], {
      cwd: fixtureDir,
      encoding: 'utf8',
    });

    const parentDir = resolve(fixtureDir, 'worktree', 'feat');
    assert.throws(
      () => {
        execFileSync('node', [worktreeScript, 'remove', parentDir], {
          cwd: fixtureDir,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      },
      (err) => {
        assert.match(
          err.stderr || err.stdout,
          /contains or is inside a registered worktree. Refusing to delete/,
        );
        return true;
      },
    );

    const insideDir = resolve(fixtureDir, 'worktree', 'feat/nested-test', 'sub');
    mkdirSync(insideDir, { recursive: true });
    assert.throws(
      () => {
        execFileSync('node', [worktreeScript, 'remove', insideDir], {
          cwd: fixtureDir,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      },
      (err) => {
        assert.match(
          err.stderr || err.stdout,
          /contains or is inside a registered worktree. Refusing to delete/,
        );
        return true;
      },
    );
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});
