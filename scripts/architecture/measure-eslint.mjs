// Re-measure complete presets through each workspace's composed ESLint configuration.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const root = fileURLToPath(new URL('../../', import.meta.url));
const scopes = {
  configs: 'node',
  'configs/env': 'node',
  ...Object.fromEntries(
    fs
      .readdirSync(path.join(root, 'packages'))
      .filter(
        (name) =>
          name !== 'config' && fs.existsSync(path.join(root, 'packages', name, 'package.json')),
      )
      .map((name) => [
        `packages/${name}`,
        ['domain', 'domain-errors'].includes(name) ? 'isomorphic' : 'node',
      ]),
  ),
  backend: 'node',
  db: 'node',
  'frontend/ui': 'browser',
  'frontend/dashboard': 'next',
  'frontend/storefront': 'next',
};
if (process.argv[2] === '--workspace') {
  const workspace = process.argv[3];
  const cwd = path.join(root, workspace);
  process.chdir(cwd);
  const { ESLint } = createRequire(path.join(root, 'configs/package.json'))('eslint');
  const { standards } = await import('../../configs/eslint/standards.js');
  const eslint = new ESLint({
    cwd,
    ...(process.argv.includes('--complete')
      ? { overrideConfig: await standards(scopes[workspace], { root: cwd }) }
      : {}),
  });
  const results = await eslint.lintFiles(['.']);
  fs.writeFileSync(process.argv[4], JSON.stringify(results));
} else {
  const measurement = {};
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-eslint-measure-'));
  try {
    for (const [workspace, role] of Object.entries(scopes)) {
      const output = path.join(directory, `${workspace.replaceAll('/', '-')}.json`);
      const run = spawnSync(
        process.execPath,
        [
          fileURLToPath(import.meta.url),
          '--workspace',
          workspace,
          output,
          ...process.argv.slice(2),
        ],
        { encoding: 'utf8' },
      );
      if (run.status !== 0) throw new Error(run.stderr || run.stdout);
      const results = JSON.parse(fs.readFileSync(output, 'utf8'));
      const byRule = {};
      for (const file of results)
        for (const message of file.messages)
          byRule[message.ruleId ?? 'parse'] = (byRule[message.ruleId ?? 'parse'] ?? 0) + 1;
      measurement[workspace] = {
        role,
        files: results.length,
        errors: results.reduce((sum, file) => sum + file.errorCount, 0),
        warnings: results.reduce((sum, file) => sum + file.warningCount, 0),
        byRule,
      };
      console.log(workspace, JSON.stringify(measurement[workspace]));
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  if (process.argv.includes('--complete'))
    fs.writeFileSync(
      path.join(root, 'configs/eslint/violations.json'),
      `${JSON.stringify(measurement, null, 2)}\n`,
    );
}
