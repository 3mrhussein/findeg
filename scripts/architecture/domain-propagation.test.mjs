import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const ts = createRequire(new URL('../../package.json', import.meta.url))('typescript');
const layers = ['db', 'packages/orders', 'backend', 'frontend/dashboard', 'frontend/storefront'];

function write(directory, file, content) {
  const target = path.join(directory, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

// Find the real declarations through the package's root export graph. No dependency
// on Domain's internal context layout: #465 can move those declarations freely.
function addValue(program, entry, name, value) {
  const checker = program.getTypeChecker();
  const symbol = checker
    .getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry)))
    .find((exported) => exported.name === name);
  assert.ok(symbol, `Missing public Domain export ${name}`);
  const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  let initializer = target.valueDeclaration.initializer;
  while (ts.isAsExpression(initializer) || ts.isSatisfiesExpression(initializer))
    initializer = initializer.expression;
  assert.ok(ts.isArrayLiteralExpression(initializer), `${name} must remain a Domain tuple`);
  const file = initializer.getSourceFile().fileName;
  const source = fs.readFileSync(file, 'utf8');
  const end = initializer.elements.end;
  fs.writeFileSync(file, source.slice(0, end) + `, '${value}'` + source.slice(end));
  return { file, source };
}

function diagnostics(program) {
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
}
function describe(errors) {
  return ts.formatDiagnosticsWithColorAndContext(errors, {
    getCanonicalFileName: (file) => file,
    getCurrentDirectory: () => root,
    getNewLine: () => '\n',
  });
}

test('new Domain values reach db, packages, backend and both apps and fail only at exhaustive per-value maps', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'findeg-domain-propagation-'));
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, 'packages/domain/package.json'), 'utf8'),
    );
    const exportEntry = (entry) =>
      typeof entry === 'string'
        ? entry
        : exportEntry(entry.import ?? entry.default ?? Object.values(entry)[0]);
    const entry = path.join(fixture, 'packages/domain', exportEntry(manifest.exports['.']));
    fs.cpSync(path.join(root, 'packages/domain/src'), path.join(fixture, 'packages/domain/src'), {
      recursive: true,
    });
    for (const layer of ['packages/domain', ...layers]) {
      fs.mkdirSync(path.join(fixture, layer), { recursive: true });
      fs.symlinkSync(
        path.join(root, layer, 'node_modules'),
        path.join(fixture, layer, 'node_modules'),
      );
    }
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(fixture, 'node_modules'));
    // The fixture copies the real Domain graph. The adapters below exercise actual
    // Drizzle/zod inference and chained layer types, not independent literal unions.
    write(
      fixture,
      'db/src/canary.ts',
      `import { pgEnum } from 'drizzle-orm/pg-core';
import { LOCALES, STOCK_LEVELS } from '@findeg/domain';
export const localeEnum = pgEnum('locale', LOCALES);
export const stockEnum = pgEnum('stock_level', STOCK_LEVELS);
export type LayerLocale = typeof localeEnum.enumValues[number];
export type LayerStockLevel = typeof stockEnum.enumValues[number];\n`,
    );
    write(
      fixture,
      'packages/orders/src/canary.ts',
      `import { z } from 'zod';
import { LOCALES, STOCK_LEVELS } from '@findeg/domain';
import type { LayerLocale as DatabaseLocale } from '../../../db/src/canary';
export const localeSchema = z.enum(LOCALES);
export const stockSchema = z.enum(STOCK_LEVELS);
export type LayerLocale = z.infer<typeof localeSchema> & DatabaseLocale;
export type LayerStockLevel = z.infer<typeof stockSchema>;\n`,
    );
    write(
      fixture,
      'backend/src/canary.ts',
      "export type { LayerLocale, LayerStockLevel } from '../../packages/orders/src/canary';\n",
    );
    for (const app of ['dashboard', 'storefront']) {
      write(
        fixture,
        `frontend/${app}/src/canary.ts`,
        "export type { LayerLocale, LayerStockLevel } from '../../../backend/src/canary';\n",
      );
      // Include the real app routing and message maps so a dynamic import cannot
      // silently accept a locale for which no translation file exists.
      fs.cpSync(
        path.join(root, `frontend/${app}/src/i18n`),
        path.join(fixture, `frontend/${app}/src/i18n`),
        { recursive: true },
      );
      fs.cpSync(
        path.join(root, `frontend/${app}/messages`),
        path.join(fixture, `frontend/${app}/messages`),
        { recursive: true },
      );
    }
    for (const app of ['dashboard', 'storefront'])
      fs.appendFileSync(
        path.join(fixture, `frontend/${app}/src/canary.ts`),
        `
import { routing } from './i18n/routing';
import type { Locale as RoutingLocale } from '@findeg/domain';
const routingPropagates: [RoutingLocale] extends [typeof routing.locales[number]] ? true : false = true;
export { routingPropagates };
`,
      );
    const files = [];
    for (const layer of layers) {
      const file = `${layer}/src/canary.ts`;
      fs.appendFileSync(
        path.join(fixture, file),
        `
import type { Locale, StockLevel } from '@findeg/domain';
export const localeLabels = { en: 'English', ar: 'Arabic' } satisfies Record<Locale, string>;
export const stockLabels = { 'out-of-stock': 'None', 'low-stock': 'Low', 'in-stock': 'Available' } satisfies Record<StockLevel, string>;
// Equalities force each adapter's inferred type to grow with Domain as well.
type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const localePropagates: Equal<Locale, import('./canary').LayerLocale> = true;
const stockPropagates: Equal<StockLevel, import('./canary').LayerStockLevel> = true;
export { localePropagates, stockPropagates };
`,
      );
      files.push(path.join(fixture, file));
    }
    const options = {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      resolveJsonModule: true,
      esModuleInterop: true,
      paths: { '@findeg/domain': [entry] },
    };
    const appFiles = ['dashboard', 'storefront'].flatMap((app) =>
      ['routing.ts', 'messages.ts'].map((file) =>
        path.join(fixture, `frontend/${app}/src/i18n/${file}`),
      ),
    );
    for (const file of appFiles)
      assert.ok(fs.existsSync(file), `Missing exhaustive app i18n seam: ${file}`);
    const roots = [entry, ...files, ...appFiles];
    const compile = () => ts.createProgram(roots, options);
    const baseline = compile();
    assert.deepEqual(diagnostics(baseline), [], describe(diagnostics(baseline)));
    for (const [name, value, label] of [
      ['LOCALES', 'zz-canary', 'localeLabels'],
      ['STOCK_LEVELS', 'canary-stock', 'stockLabels'],
    ]) {
      const previous = addValue(baseline, entry, name, value);
      const errors = diagnostics(compile());
      assert.ok(errors.length, `${name} compiled silently`);
      for (const layer of layers)
        assert.ok(
          errors.some(
            (error) => error.file?.fileName === path.join(fixture, `${layer}/src/canary.ts`),
          ),
          `${name} did not reach ${layer}`,
        );
      if (name === 'LOCALES')
        for (const app of ['dashboard', 'storefront']) {
          assert.ok(
            errors.some(
              (error) =>
                error.file?.fileName === path.join(fixture, `frontend/${app}/src/i18n/messages.ts`),
            ),
            `Missing ${app} translation must fail`,
          );
        }
      for (const error of errors) {
        assert.ok([2741, 1360].includes(error.code), describe([error]));
        const line = error.file.getLineAndCharacterOfPosition(error.start).line;
        const text = error.file.text.split('\n')[line];
        assert.ok(
          text.includes(label) ||
            (name === 'LOCALES' && error.file.fileName.endsWith('/i18n/messages.ts')),
          describe([error]),
        );
      }
      // Supplying the new per-value data repairs every failure without changes to
      // tuples, inferred schemas, routing or the layer type adapters.
      const repairs = [];
      for (const file of files) {
        const source = fs.readFileSync(file, 'utf8');
        repairs.push({ file, source });
        fs.writeFileSync(
          file,
          source.replace(`${label} = {`, `${label} = { '${value}': 'Canary',`),
        );
      }
      if (name === 'LOCALES')
        for (const app of ['dashboard', 'storefront']) {
          const file = path.join(fixture, `frontend/${app}/src/i18n/messages.ts`);
          const source = fs.readFileSync(file, 'utf8');
          repairs.push({ file, source });
          fs.writeFileSync(file, source.replace('= {', `= { '${value}': async () => ({}),`));
        }
      const repaired = diagnostics(compile());
      assert.deepEqual(repaired, [], describe(repaired));
      for (const repair of [previous, ...repairs]) fs.writeFileSync(repair.file, repair.source);
    }
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
