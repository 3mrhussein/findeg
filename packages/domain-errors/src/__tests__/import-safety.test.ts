import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import manifest from '../../package.json' with { type: 'json' };

const srcDir = join(import.meta.dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(path);
    return entry.name.endsWith('.ts') ? [path] : [];
  });
}

const IMPORT_SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(?\s*)['"]([^'"]+)['"]/g;

describe('@findeg/domain-errors import safety', () => {
  // Orders and other packages import these constructors without pulling in an
  // environment, session, database or Backend module.
  it('imports nothing outside its own source', () => {
    const external = sourceFiles(srcDir).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(IMPORT_SPECIFIER)]
        .map((match) => match[1])
        .filter((specifier) => !specifier.startsWith('./') && !specifier.startsWith('../'))
        .map((specifier) => `${relative(srcDir, file)}: ${specifier}`),
    );

    expect(external).toEqual([]);
  });

  it('declares no runtime dependencies', () => {
    expect(manifest).not.toHaveProperty('dependencies');
    expect(manifest).not.toHaveProperty('peerDependencies');
  });
});
