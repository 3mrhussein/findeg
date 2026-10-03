#!/usr/bin/env node
// Sets or checks the repo variable AUTO_REVIEW.
//   node scripts/auto-review-mode.mjs                   -> prints current: claude | codex | off
//   node scripts/auto-review-mode.mjs claude|codex|off  -> sets which bot automatically reviews PRs on open
import { execFileSync } from 'node:child_process';

const MODES = ['claude', 'codex', 'off'];
const arg = process.argv[2];

const getMode = () => {
  try {
    const val = execFileSync('gh', ['variable', 'get', 'AUTO_REVIEW'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .trim()
      .toLowerCase();
    return MODES.includes(val) ? val : 'off';
  } catch {
    return 'off';
  }
};

if (arg === undefined) {
  console.log(getMode());
} else if (MODES.includes(arg)) {
  execFileSync('gh', ['variable', 'set', 'AUTO_REVIEW', '--body', arg], {
    stdio: 'inherit',
  });
  console.log(`Auto review set to: ${arg}`);
} else {
  console.error('usage: auto-review-mode.mjs [claude|codex|off]');
  process.exit(1);
}
