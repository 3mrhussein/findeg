import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// This complements human review; it cannot establish semantic documentation accuracy.
const required = [
  'CONTEXT.md',
  'docs/adr/0001-target-architecture.md',
  'docs/contracts/openapi/v1.yaml',
  'docs/package-guidance.md',
  'docs/operations/README.md',
  'docs/operations/production-readiness.md',
  'docs/operations/outbox-delivery.md',
];
for (const path of required) {
  const contents = readFileSync(path, 'utf8');
  if (!contents.trim() || /^(?:<{7}|={7}|>{7})/m.test(contents)) {
    throw new Error(`Missing or conflicted canonical documentation: ${path}`);
  }
}
const base = process.env.BASE_REVISION;
if (base && !/^0+$/.test(base)) {
  if (!/^[a-f0-9]{40}$/.test(base)) throw new Error('Invalid documentation base revision');
  const changed = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], {
    encoding: 'utf8',
  })
    .trim()
    .split('\n');
  if (
    changed.some((path) =>
      /^(backend\/src|db\/(src|migrations)|runtime\/src|frontend\/web\/src|\.github\/workflows|scripts)\//.test(
        path,
      ),
    ) &&
    !changed.some((path) => /^(docs\/.*\.md|docs\/contracts\/.*|CONTEXT\.md)$/.test(path))
  ) {
    throw new Error('Implementation changes require canonical documentation updates and review');
  }
}
console.log('Documentation gate passed; semantic accuracy requires release review.');
