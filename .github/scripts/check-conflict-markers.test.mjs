import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

const root = new URL('../../', import.meta.url);
const checker = '.github/scripts/check-conflict-markers.mjs';
const workflow = readFileSync(new URL('.github/workflows/ci-jobs.yml', root), 'utf8');
const ciCommand = /- name: Reject tracked conflict markers\n\s+run: (.+)/.exec(workflow)?.[1];

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'conflict-markers-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  function run(command, args, options = {}) {
    return spawnSync(command, args, { cwd, encoding: 'utf8', ...options });
  }
  function git(...args) {
    const result = run('git', args);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  }
  function write(path, content) {
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    writeFileSync(join(cwd, path), content);
  }
  git('init', '--quiet');
  git('config', 'user.name', 'Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  for (const path of [checker, '.husky/pre-commit']) {
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    copyFileSync(new URL(path, root), join(cwd, path));
  }
  write('clean.txt', 'clean\n');
  git('add', '.');
  git('-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', 'baseline');
  return { cwd, run, git, write, check: () => run(process.execPath, [checker]) };
}

for (const marker of [
  '<<<<<<< HEAD',
  '=======',
  '>>>>>>> topic',
  '||||||| base',
  '<'.repeat(12) + ' ours',
]) {
  test(`rejects indexed marker ${marker}`, (t) => {
    const f = fixture(t);
    // Include spaces and Unicode in paths; a line number must survive diagnostics.
    f.write('docs/شرح example.md', `before\n${marker}\nafter\n`);
    f.git('add', '.');
    const result = f.check();
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /Conflict markers in the Git index/);
    assert.ok(result.stderr.includes(marker));
  });
}

test('checks staged blobs rather than unstaged repairs, from any directory', (t) => {
  const f = fixture(t);
  f.write('clean.txt', '<<<<<<< HEAD\n');
  f.git('add', 'clean.txt');
  f.write('clean.txt', 'repaired only in worktree\n');
  const result = f.run(process.execPath, [join(f.cwd, checker)], { cwd: join(f.cwd, '.github') });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /clean.txt:1/);
  f.git('add', 'clean.txt');
  f.write('clean.txt', '>>>>>>> unstaged\n');
  assert.equal(f.check().status, 0, 'unstaged content is outside the index contract');
});

test('accepts explicit inline and indented examples, binary blobs, deleted and untracked files', (t) => {
  const f = fixture(t);
  f.write(
    'examples.md',
    '`<<<<<<< HEAD`\n\n    <<<<<<< HEAD\n    =======\n    >>>>>>> topic\n    ||||||| base\n',
  );
  f.write('binary.dat', Buffer.from('\0\n<<<<<<< HEAD\n'));
  f.git('add', '.');
  f.write('untracked.txt', '<<<<<<< untracked\n');
  f.git('rm', 'clean.txt');
  const result = f.check();
  assert.equal(result.status, 0, result.stderr);
});

test('CI command rejects pre-existing tracked markers on a docs-only change', (t) => {
  const f = fixture(t);
  assert.equal(ciCommand, `node ${checker}`);
  f.write('legacy.md', '<<<<<<< HEAD\n');
  f.git('add', '.');
  f.git('-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', 'legacy conflict');
  f.write('another.md', 'unrelated documentation\n');
  f.git('add', '.');
  assert.equal(
    f.run('git', ['diff', '--cached', '--check']).status,
    0,
    'diff alone misses old markers',
  );
  const result = f.run('sh', ['-c', ciCommand]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /legacy.md:1/);
  const integrity = /^ {2}integrity:\n([\s\S]*?)(?=^ {2}[a-z][a-z0-9-]*:)/m.exec(workflow)?.[1];
  assert.ok(integrity);
  assert.doesNotMatch(
    integrity,
    /^ {4}(?:if|needs):/m,
    'integrity must run independently of the plan',
  );
  assert.match(workflow, /needs: \[plan, integrity, checks,/);
});

test('CI / Gate rejects a failed integrity job even when application checks are skipped', () => {
  for (const integrity of ['success', 'failure', 'cancelled']) {
    const needs = Object.fromEntries(
      Object.entries({
        plan: 'success',
        integrity,
        checks: 'skipped',
        architecture: 'skipped',
        build: 'skipped',
        integration: 'skipped',
        e2e: 'skipped',
      }).map(([job, result]) => [job, { result }]),
    );
    const result = spawnSync(
      process.execPath,
      [
        new URL('.github/scripts/ci-cli.mjs', root).pathname,
        'verdict',
        '--tier',
        'fast',
        '--needs',
        JSON.stringify(needs),
      ],
      { encoding: 'utf8' },
    );
    assert.equal(result.status, integrity === 'success' ? 0 : 1, result.stderr);
    if (integrity !== 'success') assert.match(result.stderr, /integrity/);
  }
});

test('the actual pre-commit hook stops commits and formatting on marker or staged whitespace failures', (t) => {
  const f = fixture(t);
  f.write('.git/hooks/pre-commit', '#!/bin/sh\nexec sh .husky/pre-commit\n');
  chmodSync(join(f.cwd, '.git/hooks/pre-commit'), 0o755);
  f.git('config', 'core.hooksPath', '.git/hooks');
  f.write('bin/pnpm', '#!/bin/sh\necho "$*" > formatter-ran\n');
  chmodSync(join(f.cwd, 'bin/pnpm'), 0o755);
  const env = { ...process.env, PATH: `${join(f.cwd, 'bin')}:${process.env.PATH}` };
  const before = f.git('rev-parse', 'HEAD');
  for (const body of ['<<<<<<< HEAD\n', 'trailing space \n']) {
    f.write('clean.txt', body);
    f.git('add', 'clean.txt');
    const result = f.run('git', ['commit', '-m', 'must fail'], { env });
    assert.notEqual(result.status, 0, result.stderr);
    assert.equal(f.git('rev-parse', 'HEAD'), before);
    assert.equal(existsSync(join(f.cwd, 'formatter-ran')), false);
  }
  f.write('clean.txt', 'safe change\n');
  f.git('add', 'clean.txt');
  const result = f.run('git', ['commit', '-m', 'must pass'], { env });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(f.cwd, 'formatter-ran'), 'utf8').trim(), 'exec lint-staged');
});

test('the hook blocks an old indexed conflict even when the staged diff is clean', (t) => {
  const f = fixture(t);
  f.write('legacy.md', '<<<<<<< HEAD\n');
  f.git('add', '.');
  f.git('-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', 'legacy conflict');
  f.write('clean.txt', 'safe change\n');
  f.git('add', 'clean.txt');
  const result = f.run('sh', ['.husky/pre-commit']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /legacy.md:1/);
});

test('Git failures fail closed rather than being reported as a clean scan', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'not-a-repo-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, [new URL(checker, root).pathname], {
    cwd,
    encoding: 'utf8',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Cannot check tracked conflict markers/);
});
