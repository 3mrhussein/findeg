#!/usr/bin/env node
// Toggles or checks the repo variable AUTO_AGENT_REVIEW.
//   node scripts/auto-review-mode.mjs          -> prints `on` or `off`
//   node scripts/auto-review-mode.mjs on|off   -> enables or disables automatic agent review on PR open
import { execFileSync } from 'node:child_process';

const arg = process.argv[2];

const getMode = () => {
  try {
    const val = execFileSync('gh', ['variable', 'get', 'AUTO_AGENT_REVIEW'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return val === 'true' ? 'on' : 'off';
  } catch {
    return 'off';
  }
};

if (arg === undefined) {
  console.log(getMode());
} else if (arg === 'on') {
  execFileSync('gh', ['variable', 'set', 'AUTO_AGENT_REVIEW', '--body', 'true'], {
    stdio: 'inherit',
  });
  console.log('Automatic PR agent review enabled (AUTO_AGENT_REVIEW=true).');
} else if (arg === 'off') {
  execFileSync('gh', ['variable', 'set', 'AUTO_AGENT_REVIEW', '--body', 'false'], {
    stdio: 'inherit',
  });
  console.log('Automatic PR agent review disabled (AUTO_AGENT_REVIEW=false).');
} else {
  console.error('usage: auto-review-mode.mjs [on|off]');
  process.exit(1);
}
