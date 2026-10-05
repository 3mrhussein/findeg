#!/usr/bin/env node
// Pre-push check for the current branch (see .husky/pre-push and ADR-0002).
// The rule lives in scripts/ci-policy/policy.mjs, shared with the CI
// `Branch policy` check, so local and CI enforcement can't drift apart.
//
// No PR exists yet at push time, so the base branch is unknown and is not
// passed. That means hotfix/* is accepted here whatever it will target, and
// the release-source rule (PRs into main) can't be judged at all; the CI
// check, which knows the PR's base, enforces both.
import { execSync } from 'node:child_process';
import { decideBranchName } from './ci-policy/policy.mjs';

const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

// Detached HEAD (e.g. mid-rebase) has no branch name to check.
if (branch !== 'HEAD') {
  const { ok, reason } = decideBranchName({ head: branch });
  if (!ok) {
    console.error(`✖ Branch name: ${reason}\n\n  Rename with: git branch -m <type>/<slug>\n`);
    process.exit(1);
  }
}
