import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const { ESLint } = createRequire(new URL('../../backend/package.json', import.meta.url))('eslint');
const ruleId = 'local/no-domain-value-set-copies';
async function copies(code, file = 'backend/src/domain-values-fixture.ts', extended = false) {
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: path.join(root, 'backend/eslint.config.js'),
    overrideConfig: { rules: { [ruleId]: ['error', { deriveNeverRedefine: extended }] } },
  });
  const [result] = await eslint.lintText(code, { filePath: path.join(root, file) });
  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
  return result.messages.filter((message) => message.ruleId === ruleId);
}

test('canonical and compatibility profiles preserve Domain ownership enforcement', async () => {
  for (const [profile, name] of [
    ['isomorphic', 'isomorphic'],
    ['node', 'node'],
    ['react-ui', 'reactUi'],
    ['next', 'next'],
  ]) {
    for (const directory of ['configs', 'packages/config']) {
      const shared = await import(
        new URL(`../../${directory}/eslint/profiles/${profile}.js`, import.meta.url)
      );
      const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: shared[name] });
      const [violation] = await eslint.lintText(
        "export const statuses = ['inactive', 'active'] as const;\n",
        { filePath: 'domain-values-fixture.ts' },
      );
      assert.equal(violation.fatalErrorCount, 0, JSON.stringify(violation.messages));
      const messages = violation.messages.filter((message) => message.ruleId === ruleId);
      assert.equal(messages.length, 1, `${directory}/${profile}`);
      assert.equal(messages[0].severity, 2);
      assert.match(messages[0].message, /ACTIVE_STATUSES/);
      const [compliant] = await eslint.lintText(
        "export { ACTIVE_STATUSES } from '@findeg/domain';\n",
        { filePath: 'domain-values-fixture.ts' },
      );
      assert.equal(compliant.errorCount, 0, JSON.stringify(compliant.messages));
    }
  }
});

test('domain ownership rejects a reversed complete value set as an error', async () => {
  const messages = await copies("export const statuses = ['inactive', 'active'] as const;");
  assert.equal(messages.length, 1);
  assert.equal(messages[0].severity, 2);
  assert.match(messages[0].message, /ACTIVE_STATUSES/);
});

test('domain ownership covers unions and SQL lists, including three-member subsets', async () => {
  for (const code of [
    "export type Status = 'shipped' | 'cancelled' | 'pending';",
    "export type Status = 'pending' | ('shipped' | 'cancelled');",
    "export const query = sql`status IN ('shipped', 'cancelled', 'pending')`;",
    "export const query = \"status in ('inactive', 'active')\";",
  ]) {
    assert.equal((await copies(code)).length, 1, code);
  }
});

test('domain ownership permits intentional fixture and owner copies', async () => {
  for (const file of [
    'backend/src/fixture.test.ts',
    'backend/src/fixture.spec.ts',
    'backend/src/__tests__/fixture.ts',
    'backend/src/testing/fixture.ts',
    'backend/tests/fixture.ts',
    'backend/specs/fixture.ts',
    'backend/cypress/fixtures/fixture.ts',
    'backend/fixtures/fixture.ts',
    'backend/migrations/fixture.ts',
  ])
    assert.equal(
      (await copies("export const statuses = ['inactive', 'active'];", file)).length,
      0,
      file,
    );
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: path.join(root, 'packages/domain/eslint.config.js'),
  });
  const [result] = await eslint.lintText(
    "export const statuses = ['inactive', 'active'] as const;",
    { filePath: path.join(root, 'packages/domain/src/fixture.ts') },
  );
  assert.equal(result.messages.filter((message) => message.ruleId === ruleId).length, 0);
});

test('live public arrays and type-only unions are protected; private and type-only runtime arrays are excluded', async () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-domain-exports-'));
  try {
    const config = path.join(fixture, 'configs');
    const domain = path.join(fixture, 'packages/domain');
    fs.mkdirSync(path.join(config, 'eslint/rules'), { recursive: true });
    fs.mkdirSync(path.join(domain, 'src'), { recursive: true });
    fs.writeFileSync(path.join(fixture, 'package.json'), '{"type":"module"}');
    fs.symlinkSync(path.join(root, 'configs/node_modules'), path.join(config, 'node_modules'));
    fs.copyFileSync(
      path.join(root, 'configs/eslint/rules/no-domain-value-set-copies.js'),
      path.join(config, 'eslint/rules/no-domain-value-set-copies.js'),
    );
    fs.writeFileSync(
      path.join(domain, 'package.json'),
      JSON.stringify({ exports: { '.': './src/index.ts' } }),
    );
    fs.writeFileSync(
      path.join(domain, 'src/index.ts'),
      "export { NEW_VALUES as FUTURE_PUBLIC } from './values'; export type * from './types';",
    );
    fs.writeFileSync(
      path.join(domain, 'src/values.ts'),
      "export const NEW_VALUES = ['future-a', 'future-b', 'future-c', 'future-d'] as const satisfies readonly string[]; const PRIVATE = ['private-a', 'private-b'] as const;",
    );
    fs.writeFileSync(
      path.join(domain, 'src/types.ts'),
      "export const TYPE_ONLY = ['type-a', 'type-b'] as const; export type FutureType = 'future-type-a' | 'future-type-b';",
    );
    fs.writeFileSync(
      path.join(config, 'eslint.config.js'),
      "import tseslint from 'typescript-eslint'; import { noDomainValueSetCopiesRule } from './eslint/rules/no-domain-value-set-copies.js'; export default [{files:['**/*.ts'],languageOptions:{parser:tseslint.parser},plugins:{local:{rules:{'no-domain-value-set-copies':noDomainValueSetCopiesRule}}},rules:{'local/no-domain-value-set-copies':'error'}}];",
    );
    const eslint = new ESLint({
      cwd: fixture,
      overrideConfigFile: path.join(config, 'eslint.config.js'),
    });
    const [result] = await eslint.lintText(
      "const future = ['future-c', 'future-a', 'future-b']; const privateValues = ['private-a', 'private-b']; const typeOnly = ['type-a', 'type-b'];",
      { filePath: path.join(fixture, 'backend/src/values.ts') },
    );
    assert.equal(result.messages.length, 1, JSON.stringify(result.messages));
    assert.match(result.messages[0].message, /FUTURE_PUBLIC/);
    const expanded = new ESLint({
      cwd: fixture,
      overrideConfigFile: path.join(config, 'eslint.config.js'),
      overrideConfig: { rules: { [ruleId]: ['error', { deriveNeverRedefine: true }] } },
    });
    const [typeCopy] = await expanded.lintText("type Copy = 'future-type-a' | 'future-type-b';", {
      filePath: path.join(fixture, 'backend/src/types.ts'),
    });
    assert.equal(typeCopy.messages.length, 1, 'Public type-only value sets must also be protected');
    assert.match(typeCopy.messages[0].message, /FutureType/);
    const configuration = fs.readFileSync(path.join(config, 'eslint.config.js'), 'utf8');
    fs.writeFileSync(path.join(domain, 'src/values.ts'), 'export const BROKEN = ;');
    fs.writeFileSync(
      path.join(config, 'invalid.config.js'),
      configuration.replace(
        'no-domain-value-set-copies.js',
        'no-domain-value-set-copies.js?invalid',
      ),
    );
    const invalid = new ESLint({
      cwd: fixture,
      overrideConfigFile: path.join(config, 'invalid.config.js'),
    });
    await assert.rejects(
      invalid.lintText('export const value = 1;', {
        filePath: path.join(fixture, 'backend/src/value.ts'),
      }),
      /Expression expected/,
    );
    fs.writeFileSync(path.join(domain, 'src/index.ts'), "export * from './missing';");
    fs.writeFileSync(
      path.join(config, 'missing.config.js'),
      configuration.replace(
        'no-domain-value-set-copies.js',
        'no-domain-value-set-copies.js?missing',
      ),
    );
    const missing = new ESLint({
      cwd: fixture,
      overrideConfigFile: path.join(config, 'missing.config.js'),
    });
    await assert.rejects(
      missing.lintText('export const value = 1;', {
        filePath: path.join(fixture, 'backend/src/value.ts'),
      }),
      /Cannot resolve domain export/,
    );
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('non-matches and compliant imports remain legal', async () => {
  for (const code of [
    "import { ORDER_STATUSES } from '@findeg/domain'; export { ORDER_STATUSES };",
    "const partial = ['pending', 'processing'];",
    "type Partial = 'pending' | 'processing';",
    "const mixed = ['pending', 'processing', 'not-a-status'];",
    "const dynamic = ['pending', variable, 'cancelled'];",
    "const query = sql`status in ('pending', ${status}, 'cancelled')`;",
    "const query = `status in ('pending', 'processing')`;",
    "const query = `status in ('pending', 'processing', 'unknown')`;",
  ])
    assert.equal((await copies(code)).length, 0, code);
});

test('Cypress support and configuration remain subject to ownership checks', async () => {
  for (const file of ['backend/cypress/support/helpers.ts', 'backend/cypress.config.ts']) {
    assert.equal(
      (await copies("export const statuses = ['inactive', 'active'];", file)).length,
      1,
      file,
    );
  }
  for (const file of ['backend/cypress/e2e/checkout.ts', 'backend/cypress/checkout.cy.ts']) {
    assert.equal(
      (await copies("export const statuses = ['inactive', 'active'];", file)).length,
      0,
      file,
    );
  }
});

test('findeg-lint rejects a copied set rather than ratcheting it as a warning', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-domain-cli-'));
  try {
    fs.symlinkSync(path.join(root, 'configs/node_modules'), path.join(fixture, 'node_modules'));
    fs.writeFileSync(
      path.join(fixture, 'package.json'),
      '{"name":"@fixture/domain-copy","type":"module"}',
    );
    const profile = pathToFileURL(path.join(root, 'configs/eslint/profiles/isomorphic.js')).href;
    fs.writeFileSync(
      path.join(fixture, 'eslint.config.js'),
      `export { isomorphic as default } from '${profile}';`,
    );
    fs.writeFileSync(
      path.join(fixture, 'index.ts'),
      "export const statuses = ['inactive', 'active'] as const;",
    );
    for (const directory of ['configs', 'packages/config']) {
      const result = spawnSync(
        process.execPath,
        [path.join(root, directory, 'bin/lint.mjs'), 'index.ts'],
        { cwd: fixture, encoding: 'utf8' },
      );
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stdout, /error\s+Use ACTIVE_STATUSES.*local\/no-domain-value-set-copies/);
    }
    fs.writeFileSync(
      path.join(fixture, 'index.ts'),
      'export { ACTIVE_STATUSES } from "@findeg/domain";\n',
    );
    for (const directory of ['configs', 'packages/config']) {
      const result = spawnSync(
        process.execPath,
        [path.join(root, directory, 'bin/lint.mjs'), 'index.ts'],
        { cwd: fixture, encoding: 'utf8' },
      );
      assert.equal(result.status, 0, result.stdout + result.stderr);
    }
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('SQL comments between list members cannot hide a copied set', async () => {
  for (const code of [
    "export const query = sql`status in ('pending', /* lifecycle */ 'shipped', 'cancelled')`;",
    "export const query = sql`status in ('pending', -- lifecycle\n 'shipped', 'cancelled')`;",
  ])
    assert.equal((await copies(code)).length, 1, code);
});

test('default-exported domain arrays are protected through public defaults and aliases, but not wildcard exports', async () => {
  const cases = [
    {
      name: 'direct default',
      entry: "export default ['future-a', 'future-b', 'future-c'] as const;",
      expected: 'default',
    },
    {
      name: 'identifier default',
      entry: "const VALUES = ['future-a', 'future-b', 'future-c'] as const; export default VALUES;",
      expected: 'default',
    },
    {
      name: 'reexported default alias',
      entry: "export { default as FUTURE_PUBLIC } from './values';",
      values: "export default ['future-a', 'future-b', 'future-c'] as const;",
      expected: 'FUTURE_PUBLIC',
    },
    {
      name: 'imported default alias',
      entry: "import VALUES from './values'; export { VALUES as FUTURE_PUBLIC };",
      values:
        "const VALUES = ['future-a', 'future-b', 'future-c'] as const; export default VALUES;",
      expected: 'FUTURE_PUBLIC',
    },
    {
      name: 'named default alias',
      entry:
        "const VALUES = ['future-a', 'future-b', 'future-c'] as const; export { VALUES as default };",
      expected: 'default',
    },
    {
      name: 'distinct defaults on two public entries',
      entry: "export default ['future-a', 'future-b', 'future-c'] as const;",
      otherEntry:
        "const VALUES = ['other-a', 'other-b', 'other-c'] as const; export default VALUES;",
      consumer:
        "const first = ['future-c', 'future-a', 'future-b']; const second = ['other-c', 'other-a', 'other-b'];",
      expected: 'default',
      expectedCount: 2,
    },
    {
      name: 'distinct named values on two public entries',
      entry: "export const VALUES = ['future-a', 'future-b', 'future-c'] as const;",
      otherEntry: "export const VALUES = ['other-a', 'other-b', 'other-c'] as const;",
      consumer:
        "const first = ['future-c', 'future-a', 'future-b']; const second = ['other-c', 'other-a', 'other-b'];",
      expected: 'VALUES',
      expectedCount: 2,
    },
    {
      name: 'wildcard excludes default',
      entry: "export * from './values';",
      values: "export default ['future-a', 'future-b', 'future-c'] as const;",
      expected: null,
    },
  ];
  for (const scenario of cases) {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-domain-default-'));
    try {
      const config = path.join(fixture, 'configs');
      const domain = path.join(fixture, 'packages/domain');
      fs.mkdirSync(path.join(config, 'eslint/rules'), { recursive: true });
      fs.mkdirSync(path.join(domain, 'src'), { recursive: true });
      fs.writeFileSync(path.join(fixture, 'package.json'), '{"type":"module"}');
      fs.symlinkSync(path.join(root, 'configs/node_modules'), path.join(config, 'node_modules'));
      fs.copyFileSync(
        path.join(root, 'configs/eslint/rules/no-domain-value-set-copies.js'),
        path.join(config, 'eslint/rules/no-domain-value-set-copies.js'),
      );
      fs.writeFileSync(
        path.join(domain, 'package.json'),
        JSON.stringify({
          exports: {
            '.': './src/index.ts',
            ...(scenario.otherEntry ? { './other': './src/other.ts' } : {}),
          },
        }),
      );
      fs.writeFileSync(path.join(domain, 'src/index.ts'), scenario.entry);
      if (scenario.otherEntry)
        fs.writeFileSync(path.join(domain, 'src/other.ts'), scenario.otherEntry);
      if (scenario.values) fs.writeFileSync(path.join(domain, 'src/values.ts'), scenario.values);
      fs.writeFileSync(
        path.join(config, 'eslint.config.js'),
        "import tseslint from 'typescript-eslint'; import { noDomainValueSetCopiesRule } from './eslint/rules/no-domain-value-set-copies.js'; export default [{files:['**/*.ts'],languageOptions:{parser:tseslint.parser},plugins:{local:{rules:{'no-domain-value-set-copies':noDomainValueSetCopiesRule}}},rules:{'local/no-domain-value-set-copies':'error'}}];",
      );
      const eslint = new ESLint({
        cwd: fixture,
        overrideConfigFile: path.join(config, 'eslint.config.js'),
      });
      const [result] = await eslint.lintText(
        scenario.consumer ?? "const future = ['future-c', 'future-a', 'future-b'];",
        { filePath: path.join(fixture, 'backend/src/values.ts') },
      );
      assert.equal(result.fatalErrorCount, 0, scenario.name);
      assert.equal(
        result.messages.length,
        scenario.expectedCount ?? (scenario.expected ? 1 : 0),
        scenario.name,
      );
      if (scenario.expected)
        assert.match(result.messages[0].message, new RegExp(scenario.expected), scenario.name);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  }
});

test('literal-key Domain objects require exhaustive satisfies maps', async () => {
  for (const code of [
    "export const labels = { active: 'Active', inactive: 'Inactive' };",
    "import type { ActiveStatus } from '@findeg/domain'; const labels = { active: 'Active' } satisfies Partial<Record<ActiveStatus, string>>;",
    "import type { ActiveStatus } from '@findeg/domain'; const labels = { active: 'Active' } satisfies Record<ActiveStatus, string>;",
    "import type { ActiveStatus } from '@findeg/domain'; const labels: Record<ActiveStatus, string> = { active: 'Active', inactive: 'Inactive' };",
  ])
    assert.equal((await copies(code, undefined, true)).length, 1, code);
  for (const code of [
    "import type { ActiveStatus as Status } from '@findeg/domain'; const labels = { active: 'Active', inactive: 'Inactive' } satisfies Record<Status, string>;",
    "import type { ActiveStatus } from '@findeg/domain'; const labels = { active: 'Active', inactive: 'Inactive' } as const satisfies Record<ActiveStatus, string>;",
    "const settings = { host: 'localhost', port: 3000 };",
  ])
    assert.equal((await copies(code, undefined, true)).length, 0, code);
});

test('hard-coded business constants fail while unrelated technical literals and imports pass', async () => {
  for (const code of [
    "const zone = 'Africa/Cairo';",
    'const zone = `Africa/Cairo`;',
    'const LOW_STOCK_MAX_UNITS = 5;',
    'const lowStockMaxUnits = 6;',
    'const options = { shippingFee: 50 };',
    "const fee = moneyFromDecimal('50.00');",
    'const pattern = /^(?:\\+20|0)1[0125]\\d{8}$/;',
  ]) {
    const messages = await copies(code, undefined, true);
    assert.equal(messages.length, 1, code);
    assert.match(messages[0].message, /hard-coding a business constant/);
  }
  for (const code of [
    "import { FLAT_SHIPPING_FEE, BUSINESS_TIME_ZONE, LOW_STOCK_MAX_UNITS } from '@findeg/domain'; const options = { shippingFee: FLAT_SHIPPING_FEE, timeZone: BUSINESS_TIME_ZONE, lowStockMaxUnits: LOW_STOCK_MAX_UNITS };",
    'const retryCount = 5; const pageSize = 50;',
    'const histogram = { 1: 0, 2: 0, 3: 0 };',
    "const city = 'Cairo'; const label = 'en';",
    "const price = moneyFromDecimal('50.00');",
    'const zone = `${continent}/Cairo`;',
  ])
    assert.equal((await copies(code, undefined, true)).length, 0, code);
});

test('per-value maps stay exhaustive through namespaces, local aliases and nesting', async () => {
  for (const code of [
    "import type * as Domain from '@findeg/domain'; const labels = { en: 'English' } satisfies Partial<Record<Domain.Locale, string>>;",
    "import type { Locale } from '@findeg/domain'; type Labels = Partial<Record<Locale, string>>; const labels = {} satisfies Labels;",
    "import type { Locale } from '@findeg/domain'; const labels = { en: 'English', ar: 'Arabic' } as Record<Locale, string> satisfies Record<Locale, string>;",
    "import type { Locale } from '@findeg/domain'; const labels = { en: 'English' };",
    "import type { Locale } from '@findeg/domain'; const labels = new Map<Locale, string>([['en', 'English']]);",
    "import type { Locale } from '@findeg/domain'; const labels = { en: 'English' } satisfies { [K in Locale]?: string };",
  ])
    assert.ok((await copies(code, undefined, true)).length > 0, code);
  for (const code of [
    "import type * as Domain from '@findeg/domain'; const labels = { en: 'English', ar: 'Arabic' } satisfies Record<Domain.Locale, string>;",
    "import type { Locale, ActiveStatus } from '@findeg/domain'; const labels = { en: { active: 'Active', inactive: 'Inactive' }, ar: { active: 'نشط', inactive: 'غير نشط' } } satisfies Record<Locale, Record<ActiveStatus, string>>;",
    "import type { Locale } from '@findeg/domain'; type Language = Locale; const labels = { en: 'English', ar: 'Arabic' } satisfies Record<Language, string>;",
  ])
    assert.equal((await copies(code, undefined, true)).length, 0, code);
});

test('expanded ownership also rejects zod lists and literal object copies', async () => {
  for (const code of [
    "const localeSchema = z.enum(['en', 'ar']);",
    "type Language = 'en' | 'ar';",
    "const labels = { en: 'English', ar: 'Arabic' };",
  ])
    assert.equal((await copies(code, undefined, true)).length, 1, code);
  for (const code of [
    "import { LOCALES } from '@findeg/domain'; const localeSchema = z.enum(LOCALES);",
    "import { STOCK_LEVELS } from '@findeg/domain'; const levels = [...STOCK_LEVELS];",
  ])
    assert.equal((await copies(code, undefined, true)).length, 0, code);
});

test('stock comparisons and aliased Domain money factories cannot hard-code business policies', async () => {
  for (const code of [
    'const low = availableStock <= 5;',
    'const low = balance.availableStock <= 5;',
    "import { moneyFromDecimal as decimal } from '@findeg/domain'; const fee = decimal('50.00');",
    'const shippingFee = money(5000n);',
  ])
    assert.equal((await copies(code, undefined, true)).length, 1, code);
  for (const code of [
    "import { LOW_STOCK_MAX_UNITS } from '@findeg/domain'; const low = availableStock <= LOW_STOCK_MAX_UNITS;",
    'const canRetry = retryCount <= 5;',
    'const size = money(5000n);',
  ])
    assert.equal((await copies(code, undefined, true)).length, 0, code);
});

test('expanded lint mode fails the existing CLI while default lint preserves the original guard', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-derive-cli-'));
  try {
    fs.copyFileSync(path.join(root, '.prettierrc'), path.join(fixture, '.prettierrc'));
    fs.symlinkSync(path.join(root, 'configs/node_modules'), path.join(fixture, 'node_modules'));
    fs.writeFileSync(
      path.join(fixture, 'package.json'),
      JSON.stringify({
        name: '@fixture/derive',
        type: 'module',
        dependencies: { '@findeg/domain': 'workspace:*' },
      }),
    );
    const profile = pathToFileURL(path.join(root, 'configs/eslint/profiles/isomorphic.js')).href;
    fs.writeFileSync(
      path.join(fixture, 'eslint.config.js'),
      `export { isomorphic as default } from '${profile}';`,
    );
    const run = (extended) =>
      spawnSync(process.execPath, [path.join(root, 'configs/bin/lint.mjs'), 'index.ts'], {
        cwd: fixture,
        encoding: 'utf8',
        env: { ...process.env, FINDEG_DOMAIN_DERIVATION: extended ? '1' : '0' },
      });
    fs.writeFileSync(
      path.join(fixture, 'index.ts'),
      "export const labels = { en: 'English', ar: 'Arabic' };\n",
    );
    const compatibility = run(false);
    assert.equal(compatibility.status, 0, compatibility.stdout + compatibility.stderr);
    const invalid = run(true);
    assert.equal(invalid.status, 1, invalid.stdout + invalid.stderr);
    assert.match(invalid.stdout, /local\/no-domain-value-set-copies/);
    fs.writeFileSync(
      path.join(fixture, 'index.ts'),
      "import type { Locale } from '@findeg/domain';\nexport const labels = { en: 'English', ar: 'Arabic' } satisfies Record<Locale, string>;\n",
    );
    const valid = run(true);
    assert.equal(valid.status, 0, valid.stdout + valid.stderr);
    fs.writeFileSync(path.join(fixture, 'index.ts'), "export const locales = ['en', 'ar'];\n");
    assert.equal(run(false).status, 1, 'Original #416 guard must stay active');
    const turbo = fs.readFileSync(path.join(root, 'turbo.json'), 'utf8');
    assert.match(turbo, /"env":\s*\[[^\]]*"FINDEG_DOMAIN_DERIVATION"/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('assertions cannot hide incomplete Domain maps and inferred Map keys are copies', async () => {
  for (const code of [
    "import type { Locale } from '@findeg/domain'; const labels = loadLabels() as Partial<Record<Locale, string>>;",
    "import type { Locale } from '@findeg/domain'; const labels = loadLabels() as Record<Locale, string>;",
    "const labels = new Map([['en', 'English'], ['ar', 'Arabic']]);",
  ])
    assert.equal((await copies(code, undefined, true)).length, 1, code);
  assert.equal(
    (
      await copies(
        "const labels = new Map([['host', 'localhost'], ['port', '3000']]);",
        undefined,
        true,
      )
    ).length,
    0,
  );
});

test('expanded mode has a separate Turbo lint hash and is passed in strict environment mode', () => {
  const hashes = [];
  for (const mode of ['0', '1']) {
    const result = spawnSync(
      'pnpm',
      ['exec', 'turbo', 'run', 'lint', '--filter=@findeg/ui', '--dry=json'],
      {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, FINDEG_DOMAIN_DERIVATION: mode },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    const task = JSON.parse(result.stdout).tasks.find(
      (candidate) => candidate.taskId === '@findeg/ui#lint',
    );
    assert.ok(task.environmentVariables.specified.env.includes('FINDEG_DOMAIN_DERIVATION'));
    hashes.push(task.hash);
  }
  assert.notEqual(hashes[0], hashes[1], 'Measurement must not reuse a default-mode lint result');
});

test('tuple-derived Domain types require exhaustive maps and permit complete per-value data', async () => {
  for (const code of [
    "import { LOCALES } from '@findeg/domain'; type Language = (typeof LOCALES)[number]; const labels = {} satisfies Partial<Record<Language, string>>;",
    "import * as Domain from '@findeg/domain'; const labels = { en: 'English' } satisfies Record<(typeof Domain.LOCALES)[number], string>;",
  ])
    assert.equal((await copies(code, undefined, true)).length, 1, code);
  for (const code of [
    "import { LOCALES as languages } from '@findeg/domain'; type Language = (typeof languages)[number]; const labels = { en: 'English', ar: 'Arabic' } satisfies Record<Language, string>;",
    "import * as Domain from '@findeg/domain'; const labels = { en: 'English', ar: 'Arabic' } satisfies Record<(typeof Domain.LOCALES)[number], string>;",
  ])
    assert.equal((await copies(code, undefined, true)).length, 0, code);
});
