#!/usr/bin/env node
// Thin CLI over policy.mjs, the entry point for workflows and git hooks.
// All decisions live in policy.mjs; this file only parses arguments and reports.
//
//   node scripts/ci-policy/cli.mjs branch-policy --head <branch> [--base <branch>]
//
// Omit --base when the PR's target branch isn't known (e.g. the pre-push hook).
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { decideBranchName, decideReleaseSource } from './policy.mjs';

// Runs the branch-name and release-source rules and prints each verdict.
// Returns true when both pass. Inside GitHub Actions, failures are emitted as
// error annotations so they show on the PR's checks page.
export function checkBranchPolicy({ head, base }) {
  const checks = [
    ['Branch name', decideBranchName({ head, base })],
    ['Release source', decideReleaseSource({ head, base })],
  ];
  for (const [title, { ok, reason }] of checks) {
    if (ok) {
      console.log(`✔ ${title}: ${reason}`);
    } else if (process.env.GITHUB_ACTIONS === 'true') {
      console.log(`::error title=${title}::${reason}`);
    } else {
      console.error(`✖ ${title}: ${reason}`);
    }
  }
  return checks.every(([, decision]) => decision.ok);
}

function main(argv) {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: { head: { type: 'string' }, base: { type: 'string' } },
  });
  const [command] = positionals;
  if (command !== 'branch-policy' || !values.head) {
    console.error('Usage: cli.mjs branch-policy --head <branch> [--base <branch>]');
    return 2;
  }
  return checkBranchPolicy({ head: values.head, base: values.base }) ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
