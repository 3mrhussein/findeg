#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';

const ALLOWED_BRANCH_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];

const BRANCH_REGEX = new RegExp(`^(${ALLOWED_BRANCH_TYPES.join('|')})/[a-z0-9][a-z0-9-]*$`);

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...opts }).trim();
}

function tryRun(cmd, opts = {}) {
  try {
    return run(cmd, opts);
  } catch {
    return null;
  }
}

function getRepoRoot() {
  const commonDir = run('git rev-parse --path-format=absolute --git-common-dir');
  return dirname(commonDir);
}

function getWorktrees() {
  const raw = run('git worktree list --porcelain');
  const worktrees = [];
  let current = {};

  for (const line of raw.split('\n')) {
    if (line.startsWith('worktree ')) {
      if (current.path) worktrees.push(current);
      current = { path: line.slice(9).trim() };
    } else if (line.startsWith('branch ')) {
      current.branch = line.slice(7).trim().replace('refs/heads/', '');
    } else if (line.startsWith('HEAD ')) {
      current.head = line.slice(5).trim();
    } else if (line.trim() === '') {
      if (current.path) {
        worktrees.push(current);
        current = {};
      }
    }
  }
  if (current.path) worktrees.push(current);
  return worktrees;
}

function isAncestor(ancestor, commit) {
  try {
    run(`git merge-base --is-ancestor "${ancestor}" "${commit}"`);
    return true;
  } catch {
    return false;
  }
}

function isWorktreeDirty(path) {
  if (!existsSync(path)) return false;
  const status = tryRun(`git -C "${path}" status --porcelain`);
  return Boolean(status && status.trim().length > 0);
}

function createWorktree(branchName, customPath) {
  if (!branchName) {
    console.error('Error: branch name is required.');
    console.error('Usage: pnpm wt:new <type>/<kebab-case-slug> [optional-path]');
    process.exit(1);
  }

  if (!BRANCH_REGEX.test(branchName)) {
    console.error(
      `Error: Invalid branch name "${branchName}". Must match <type>/<kebab-case-slug> where type is one of:\n  ${ALLOWED_BRANCH_TYPES.join(', ')}`,
    );
    process.exit(1);
  }

  const root = getRepoRoot();
  const targetPath = customPath
    ? isAbsolute(customPath)
      ? customPath
      : resolve(process.cwd(), customPath)
    : resolve(root, 'worktree', branchName);

  if (existsSync(targetPath)) {
    console.error(`Error: Target directory already exists: ${targetPath}`);
    process.exit(1);
  }

  console.log('Fetching latest origin/develop...');
  run('git fetch origin develop');

  const developSha = run('git rev-parse --short origin/develop');
  const localBranchExists =
    tryRun(`git show-ref --verify --quiet refs/heads/${branchName}`) !== null;

  if (localBranchExists) {
    console.log(`Branch "${branchName}" already exists. Creating worktree for existing branch...`);
    run(`git worktree add "${targetPath}" "${branchName}"`);
  } else {
    console.log(`Creating branch "${branchName}" off origin/develop (${developSha})...`);
    run(`git worktree add -b "${branchName}" "${targetPath}" origin/develop`);
  }

  console.log(`\n✓ Worktree created successfully!`);
  console.log(`  Path:   ${targetPath}`);
  console.log(`  Branch: ${branchName}`);
  console.log(`  Base:   origin/develop (${developSha})\n`);
}

function removeWorktree(identifier) {
  if (!identifier) {
    console.error('Error: worktree path or branch name is required.');
    console.error('Usage: pnpm wt:rm <path-or-branch>');
    process.exit(1);
  }

  const root = getRepoRoot();
  const worktrees = getWorktrees();

  const resolvedInput = isAbsolute(identifier) ? identifier : resolve(process.cwd(), identifier);
  const match = worktrees.find(
    (wt) =>
      wt.path === resolvedInput || wt.branch === identifier || wt.path.endsWith(`/${identifier}`),
  );

  if (match) {
    if (match.path === root) {
      console.error('Error: Cannot remove the root workspace repository.');
      process.exit(1);
    }

    console.log(`Removing worktree: ${match.path} (${match.branch || 'detached'})...`);
    tryRun(`git worktree remove --force "${match.path}"`);
    if (existsSync(match.path)) {
      rmSync(match.path, { recursive: true, force: true });
    }
    run('git worktree prune');
    console.log(`✓ Removed worktree and cleaned up directory: ${match.path}`);
  } else if (existsSync(resolvedInput)) {
    console.log(
      `Directory ${resolvedInput} is not registered in git worktree list. Cleaning up directory...`,
    );
    rmSync(resolvedInput, { recursive: true, force: true });
    run('git worktree prune');
    console.log(`✓ Cleaned up unregistered directory: ${resolvedInput}`);
  } else {
    console.error(`Error: No active worktree found for "${identifier}".`);
    process.exit(1);
  }
}

function pruneWorktrees() {
  const root = getRepoRoot();
  console.log('Fetching latest origin/develop...');
  run('git fetch origin develop');

  const worktrees = getWorktrees();
  let removedCount = 0;

  for (const wt of worktrees) {
    if (wt.path === root) continue;

    if (!wt.branch) {
      continue;
    }

    const isMerged = isAncestor(wt.branch, 'origin/develop');
    const isDirty = isWorktreeDirty(wt.path);

    if (isMerged && !isDirty) {
      console.log(`Pruning merged worktree: ${wt.path} (${wt.branch})...`);
      tryRun(`git worktree remove --force "${wt.path}"`);
      if (existsSync(wt.path)) {
        rmSync(wt.path, { recursive: true, force: true });
      }
      removedCount++;
    } else if (isMerged && isDirty) {
      console.log(
        `⚠ Skipping ${wt.path} (${wt.branch}): branch is merged but worktree has uncommitted changes.`,
      );
    }
  }

  const candidateParents = [resolve(root, 'worktree'), resolve(root, '.claude', 'worktrees')];

  for (const parent of candidateParents) {
    if (!existsSync(parent)) continue;

    const entries = readdirSync(parent);
    for (const entry of entries) {
      const fullPath = resolve(parent, entry);
      if (!statSync(fullPath).isDirectory()) continue;

      const subtrees = getWorktrees();
      const isTracked = subtrees.some(
        (wt) => wt.path === fullPath || wt.path.startsWith(`${fullPath}/`),
      );
      if (!isTracked) {
        console.log(`Pruning orphaned directory: ${fullPath}...`);
        rmSync(fullPath, { recursive: true, force: true });
        removedCount++;
      }
    }
  }

  run('git worktree prune');
  console.log(`\n✓ Prune complete. Cleaned up ${removedCount} worktrees / orphaned directories.`);
}

function listWorktrees() {
  const root = getRepoRoot();
  run('git fetch origin develop');
  const worktrees = getWorktrees();

  console.log('\nActive Git Worktrees:');
  console.log('--------------------------------------------------------------------------------');
  for (const wt of worktrees) {
    const isRoot = wt.path === root ? ' [ROOT]' : '';
    const branch = wt.branch || '(detached)';
    const dirty = isWorktreeDirty(wt.path) ? ' [DIRTY]' : '';
    const merged =
      branch !== 'develop' && branch !== '(detached)' && isAncestor(branch, 'origin/develop')
        ? ' [MERGED]'
        : '';

    console.log(`• ${branch.padEnd(35)} ${wt.path}${isRoot}${dirty}${merged}`);
  }
  console.log('--------------------------------------------------------------------------------\n');
}

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'create':
  case 'new':
  case 'add':
    createWorktree(args[0], args[1]);
    break;
  case 'remove':
  case 'rm':
  case 'delete':
    removeWorktree(args[0]);
    break;
  case 'prune':
  case 'clean':
    pruneWorktrees();
    break;
  case 'list':
  case 'ls':
    listWorktrees();
    break;
  default:
    console.log(`FindEg Worktree Management CLI

Usage:
  node scripts/worktree.mjs create <type>/<slug> [custom-path]  Create new worktree synced with origin/develop
  node scripts/worktree.mjs remove <path-or-branch>             Cleanly remove worktree and delete folder
  node scripts/worktree.mjs prune                               Remove merged worktrees and ghost directories
  node scripts/worktree.mjs list                                List all worktrees with sync/dirty status
`);
    break;
}
