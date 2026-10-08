#!/usr/bin/env node
// Pre-push validation hook for the current branch (see .husky/pre-push and ADR-0002).
// Shared with CI's `Branch policy` check via ci-policy.mjs to ensure local and CI enforcement never drift.
//
// At push time, the target base branch is not known, so hotfix/* branches are accepted
// locally, and base branch restrictions are validated in CI when the PR is opened.

import { execSync } from 'node:child_process';
import { decideBranchName } from './ci-policy.mjs';

const currentBranchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

// Detached HEAD (e.g. during a rebase or bisect) has no branch name to check.
if (currentBranchName !== 'HEAD') {
  const { ok, reason } = decideBranchName({ head: currentBranchName });
  if (!ok) {
    console.error(`✖ Branch name: ${reason}\n\n  Rename with: git branch -m <type>/<slug>\n`);
    process.exit(1);
  }
}
