import { spawnSync } from 'node:child_process';

// Scan index blobs rather than working files: partial staging and CI's checkout
// must inspect exactly the content being committed. No path-wide exemptions.
const result = spawnSync(
  'git',
  [
    'grep',
    '--cached',
    '--full-name',
    '-n',
    '-I',
    '-E',
    '^(<{7,}|={7,}|>{7,}|[|]{7,})([[:space:]].*)?$',
    '--',
    ':/',
  ],
  { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
);

if (result.error || (result.status !== 0 && result.status !== 1)) {
  console.error('Cannot check tracked conflict markers:', result.error?.message || result.stderr);
  process.exitCode = 1;
} else if (result.status === 0) {
  console.error('Conflict markers in the Git index:\n' + result.stdout);
  console.error(
    'Resolve the conflict. For intentional examples, use inline code or indent the line.',
  );
  process.exitCode = 1;
} else {
  console.log('No conflict markers in tracked text in the Git index.');
}
