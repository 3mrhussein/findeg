import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const { ESLint } = createRequire(new URL('../../configs/package.json', import.meta.url))('eslint');

test('default library lint enforces strict typing and naming without formatting checks', async () => {
  process.chdir(path.join(root, 'packages/domain'));
  const eslint = new ESLint({ cwd: path.join(root, 'packages/domain') });
  const [result] = await eslint.lintText(
    'export const BadValue=1;\nexport function loadValue(): Promise<number> { return Promise.resolve(1); }\nloadValue();\n',
    { filePath: 'src/index.ts' },
  );
  assert.ok(
    result.messages.some(({ ruleId }) => ruleId === '@typescript-eslint/no-floating-promises'),
  );
  assert.ok(result.messages.some(({ ruleId }) => ruleId === 'findeg/naming'));
  assert.ok(!result.messages.some(({ ruleId }) => ruleId === 'prettier/prettier'));
  const [unformatted] = await eslint.lintText('export const size=1', { filePath: 'src/index.ts' });
  assert.equal(unformatted.errorCount, 0, JSON.stringify(unformatted.messages));
  process.chdir(path.join(root, 'backend'));
  const staged = new ESLint({ cwd: path.join(root, 'backend') });
  const [compatible] = await staged.lintText(
    'export const BadValue=1;\nexport function loadValue(): Promise<number> { return Promise.resolve(1); }\nloadValue();\n',
    { filePath: 'src/index.ts' },
  );
  assert.equal(compatible.errorCount, 0, JSON.stringify(compatible.messages));
});
