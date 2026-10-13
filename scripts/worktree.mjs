#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, realpathSync, rmSync, statSync } from 'node:fs';
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

function git(args, opts = {}) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    ...opts,
  }).trim();
}

function tryGit(args, opts = {}) {
  try {
    return git(args, opts);
  } catch {
    return null;
  }
}

function toReal(path) {
  if (!path) return path;
  try {
    return existsSync(path) ? realpathSync(path) : path;
  } catch {
    return path;
  }
}

function getRepoRoot() {
  const commonDir = git(['rev-parse', '--path-format=absolute', '--git-common-dir']);
  return toReal(dirname(commonDir));
}

function getWorktrees() {
  const raw = git(['worktree', 'list', '--porcelain']);
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
    git(['merge-base', '--is-ancestor', ancestor, commit]);
    return true;
  } catch {
    return false;
  }
}

function isBranchMerged(branchName) {
  if (!branchName || branchName === 'develop' || branchName === '(detached)') {
    return false;
  }
  const branchSha = tryGit(['rev-parse', `refs/heads/${branchName}`]);
  const developSha = tryGit(['rev-parse', 'origin/develop']);
  if (!branchSha || !developSha) return false;
  // If the branch tip equals origin/develop, it has no unique commits (e.g. freshly created)
  if (branchSha === developSha) {
    return false;
  }
  return isAncestor(branchName, 'origin/develop');
}

function isWorktreeDirty(path) {
  if (!existsSync(path)) return false;
  const status = tryGit(['-C', path, 'status', '--porcelain']);
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
  tryGit(['fetch', 'origin', 'develop']);

  const developSha = tryGit(['rev-parse', '--short', 'origin/develop']) || 'develop';
  const localBranchExists =
    tryGit(['show-ref', '--verify', '--quiet', `refs/heads/${branchName}`]) !== null;

  if (localBranchExists) {
    console.log(`Branch "${branchName}" already exists. Creating worktree for existing branch...`);
    git(['worktree', 'add', targetPath, branchName]);
  } else {
    console.log(`Creating branch "${branchName}" off origin/develop (${developSha})...`);
    git(['worktree', 'add', '-b', branchName, targetPath, 'origin/develop']);
  }

  console.log(`\n✓ Worktree created successfully!`);
  console.log(`  Path:   ${targetPath}`);
  console.log(`  Branch: ${branchName}`);
  console.log(`  Base:   origin/develop (${developSha})\n`);
}

function removeWorktree(identifier, ...flags) {
  if (!identifier) {
    console.error('Error: worktree path or branch name is required.');
    console.error('Usage: pnpm wt:rm <path-or-branch> [--force]');
    process.exit(1);
  }

  const isForce = flags.includes('--force') || flags.includes('-f');
  const root = getRepoRoot();
  const worktrees = getWorktrees();

  const resolvedInput = isAbsolute(identifier) ? identifier : resolve(process.cwd(), identifier);
  const realInput = toReal(resolvedInput);
  const rootRelativeInput = resolve(root, identifier);
  const realRootRelative = toReal(rootRelativeInput);

  // Match exact path or branch name without loose suffix matches to prevent accidental deletions
  const matches = worktrees.filter((wt) => {
    const wtReal = toReal(wt.path);
    return (
      wtReal === realInput ||
      wtReal === realRootRelative ||
      wt.path === resolvedInput ||
      wt.branch === identifier
    );
  });

  if (matches.length > 1) {
    console.error(`Error: Multiple worktrees match "${identifier}":`);
    for (const m of matches) {
      console.error(`  - ${m.path} (${m.branch || 'detached'})`);
    }
    console.error('Please specify the exact full path.');
    process.exit(1);
  }

  const match = matches[0];

  if (match) {
    if (toReal(match.path) === root) {
      console.error('Error: Cannot remove the root workspace repository.');
      process.exit(1);
    }

    if (isWorktreeDirty(match.path) && !isForce) {
      console.error(
        `Error: Worktree "${match.path}" has uncommitted changes. Use --force to remove anyway.`,
      );
      process.exit(1);
    }

    console.log(`Removing worktree: ${match.path} (${match.branch || 'detached'})...`);
    const removeArgs = ['worktree', 'remove'];
    if (isForce) removeArgs.push('--force');
    removeArgs.push(match.path);

    const removed = tryGit(removeArgs);
    if (removed === null) {
      console.error(`Error: Git refused to remove worktree "${match.path}".`);
      process.exit(1);
    }
    if (existsSync(match.path)) {
      rmSync(match.path, { recursive: true, force: true });
    }
    git(['worktree', 'prune']);
    console.log(`✓ Removed worktree and cleaned up directory: ${match.path}`);
    return;
  }

  // Fallback for unregistered leftover directories, strictly confined to worktree containment directories
  const allowedParents = [resolve(root, 'worktree'), resolve(root, '.claude', 'worktrees')].map(
    toReal,
  );
  const targetDir = existsSync(resolvedInput)
    ? realInput
    : existsSync(rootRelativeInput)
      ? realRootRelative
      : null;

  if (targetDir) {
    const isContained = allowedParents.some((parent) => targetDir.startsWith(`${parent}/`));
    if (!isContained) {
      console.error(
        `Error: Refusing to remove directory outside worktree containers: ${targetDir}`,
      );
      process.exit(1);
    }

    const overlaps = worktrees.some((wt) => {
      const wtReal = toReal(wt.path);
      return (
        wtReal === targetDir ||
        wtReal.startsWith(`${targetDir}/`) ||
        targetDir.startsWith(`${wtReal}/`)
      );
    });
    if (overlaps) {
      console.error(
        `Error: ${targetDir} contains or is inside a registered worktree. Refusing to delete.`,
      );
      process.exit(1);
    }

    console.log(
      `Directory ${targetDir} is not registered in git worktree list. Cleaning up directory...`,
    );
    rmSync(targetDir, { recursive: true, force: true });
    git(['worktree', 'prune']);
    console.log(`✓ Cleaned up unregistered directory: ${targetDir}`);
    return;
  }

  console.error(`Error: No active worktree found for "${identifier}".`);
  process.exit(1);
}

function pruneWorktrees() {
  const root = getRepoRoot();
  console.log('Fetching latest origin/develop...');
  tryGit(['fetch', 'origin', 'develop']);

  const worktrees = getWorktrees();
  let removedCount = 0;

  for (const wt of worktrees) {
    if (toReal(wt.path) === root) continue;
    if (!wt.branch) continue;

    const isMerged = isBranchMerged(wt.branch);
    const isDirty = isWorktreeDirty(wt.path);

    if (isMerged && !isDirty) {
      console.log(`Pruning merged worktree: ${wt.path} (${wt.branch})...`);
      tryGit(['worktree', 'remove', '--force', wt.path]);
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

  const candidateParents = [resolve(root, 'worktree'), resolve(root, '.claude', 'worktrees')].map(
    toReal,
  );

  for (const parent of candidateParents) {
    if (!existsSync(parent)) continue;

    const entries = readdirSync(parent);
    for (const entry of entries) {
      const fullPath = toReal(resolve(parent, entry));
      if (!statSync(fullPath).isDirectory()) continue;

      const subtrees = getWorktrees();
      const isTracked = subtrees.some((wt) => {
        const wtReal = toReal(wt.path);
        return wtReal === fullPath || wtReal.startsWith(`${fullPath}/`);
      });
      if (!isTracked) {
        console.log(`Pruning orphaned directory: ${fullPath}...`);
        rmSync(fullPath, { recursive: true, force: true });
        removedCount++;
      }
    }
  }

  git(['worktree', 'prune']);
  console.log(`\n✓ Prune complete. Cleaned up ${removedCount} worktrees / orphaned directories.`);
}

function listWorktrees() {
  const root = getRepoRoot();
  tryGit(['fetch', 'origin', 'develop']);
  const worktrees = getWorktrees();

  console.log('\nActive Git Worktrees:');
  console.log('--------------------------------------------------------------------------------');
  for (const wt of worktrees) {
    const isRoot = toReal(wt.path) === root ? ' [ROOT]' : '';
    const branch = wt.branch || '(detached)';
    const dirty = isWorktreeDirty(wt.path) ? ' [DIRTY]' : '';
    const merged = isBranchMerged(branch) ? ' [MERGED]' : '';

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
    removeWorktree(args[0], ...args.slice(1));
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
  node scripts/worktree.mjs remove <path-or-branch> [--force]   Cleanly remove worktree and delete folder
  node scripts/worktree.mjs prune                               Remove merged worktrees and ghost directories
  node scripts/worktree.mjs list                                List all worktrees with sync/dirty status
`);
    break;
}
