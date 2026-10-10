#!/usr/bin/env node
// Pre-push validation hook for the current branch (see .husky/pre-push and ADR-0002).
// Shared with CI's `Branch policy` check via ci-policy.mjs to ensure local and CI enforcement never drift.
//
// At push time, the target base branch is not known, so hotfix/* branches are accepted
// locally, and base branch restrictions are validated in CI when the PR is opened.

import { execFileSync, execSync } from 'node:child_process';
import {
  decideBranchName,
  decidePrTitleSuggestion,
  issueNumberFromBranch,
  prBaseBranch,
  prOpenUrl,
} from './ci-policy.mjs';

const currentBranchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

// Best effort: a missing remote, base branch or `gh` only drops that input from the title.
function tryRun(command, args) {
  try {
    return execFileSync(command, args, { stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 })
      .toString()
      .trim();
  } catch {
    return undefined;
  }
}

// Prints a link that opens the new-PR form with the `Feature | #122 | Add x` title filled in.
function printPrLink(head) {
  const repoUrl = tryRun('git', ['remote', 'get-url', 'origin']);
  if (!repoUrl) return;
  const issue = issueNumberFromBranch(head);
  const issueTitle = issue
    ? tryRun('gh', ['issue', 'view', String(issue), '--json', 'title', '--jq', '.title'])
    : undefined;
  const onlyCommit =
    tryRun('git', ['rev-list', '--count', `origin/${prBaseBranch(head)}..HEAD`]) === '1'
      ? tryRun('git', ['log', '-1', '--format=%s'])
      : undefined;
  const suggestion = decidePrTitleSuggestion({ head, issueTitle, commitSubject: onlyCommit });
  if (!suggestion.ok) return;
  console.log(`\n  Open the PR: ${prOpenUrl({ repoUrl, head, title: suggestion.title })}\n`);
}

// Detached HEAD (e.g. during a rebase or bisect) has no branch name to check.
if (currentBranchName !== 'HEAD') {
  const { ok, reason } = decideBranchName({ head: currentBranchName });
  if (!ok) {
    console.error(`✖ Branch name: ${reason}\n\n  Rename with: git branch -m <type>/<slug>\n`);
    process.exit(1);
  }
  printPrLink(currentBranchName);
}
