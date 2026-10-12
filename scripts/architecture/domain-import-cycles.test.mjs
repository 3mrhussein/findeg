import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

// @findeg/domain has no runtime import cycle: no value import, side-effect import or value
// re-export leads from a module back to itself. Type-only imports are erased, so they never count.

const require = createRequire(new URL('../../packages/domain/package.json', import.meta.url));
const ts = require('typescript');
const srcDir = fileURLToPath(new URL('../../packages/domain/src/', import.meta.url));

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return entry.name.endsWith('.ts') ? [full] : [];
  });
}

function resolve(from, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), specifier);
  for (const candidate of [`${base}.ts`, path.join(base, 'index.ts')]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`${path.relative(srcDir, from)}: cannot resolve ${specifier}`);
}

const isTypeOnlyImport = (clause) => {
  if (!clause) return false; // `import './x'` runs the module
  if (clause.isTypeOnly) return true;
  const bindings = clause.namedBindings;
  return (
    !clause.name &&
    bindings !== undefined &&
    ts.isNamedImports(bindings) &&
    bindings.elements.length > 0 &&
    bindings.elements.every((element) => element.isTypeOnly)
  );
};

const isTypeOnlyExport = (declaration) =>
  declaration.isTypeOnly ||
  (declaration.exportClause !== undefined &&
    ts.isNamedExports(declaration.exportClause) &&
    declaration.exportClause.elements.length > 0 &&
    declaration.exportClause.elements.every((element) => element.isTypeOnly));

/** Each module's runtime dependencies inside the package. */
function runtimeGraph() {
  const graph = new Map();
  for (const file of sourceFiles(srcDir)) {
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest);
    const edges = new Set();
    for (const statement of source.statements) {
      let specifier;
      if (ts.isImportDeclaration(statement) && !isTypeOnlyImport(statement.importClause)) {
        specifier = statement.moduleSpecifier;
      } else if (
        ts.isExportDeclaration(statement) &&
        statement.moduleSpecifier &&
        !isTypeOnlyExport(statement)
      ) {
        specifier = statement.moduleSpecifier;
      }
      const target = specifier && resolve(file, specifier.text);
      if (target) edges.add(target);
    }
    graph.set(file, edges);
  }
  return graph;
}

/** Every strongly connected component with a cycle (Tarjan). */
function cycles(graph) {
  let index = 0;
  const indices = new Map();
  const low = new Map();
  const stack = [];
  const onStack = new Set();
  const found = [];
  const visit = (node) => {
    indices.set(node, index);
    low.set(node, index);
    index += 1;
    stack.push(node);
    onStack.add(node);
    for (const next of graph.get(node) ?? []) {
      if (!indices.has(next)) {
        visit(next);
        low.set(node, Math.min(low.get(node), low.get(next)));
      } else if (onStack.has(next)) {
        low.set(node, Math.min(low.get(node), indices.get(next)));
      }
    }
    if (low.get(node) === indices.get(node)) {
      const component = [];
      let member;
      do {
        member = stack.pop();
        onStack.delete(member);
        component.push(member);
      } while (member !== node);
      if (component.length > 1 || graph.get(node)?.has(node)) found.push(component);
    }
  };
  for (const node of graph.keys()) if (!indices.has(node)) visit(node);
  return found.map((component) => component.map((file) => path.relative(srcDir, file)).sort());
}

test('@findeg/domain has no runtime import cycle', () => {
  const graph = runtimeGraph();
  assert.ok(graph.size > 20, 'the scan found the domain sources');
  assert.deepEqual(cycles(graph), []);
});

test('the scan sees a value import cycle and ignores a type-only one', () => {
  const a = path.join(srcDir, 'a.ts');
  const b = path.join(srcDir, 'b.ts');
  assert.deepEqual(
    cycles(
      new Map([
        [a, new Set([b])],
        [b, new Set([a])],
      ]),
    ),
    [['a.ts', 'b.ts']],
  );
  const typeOnly = ts.createSourceFile('x.ts', "import { type A, type B } from './a';", 99);
  assert.equal(isTypeOnlyImport(typeOnly.statements[0].importClause), true);
  const mixed = ts.createSourceFile('x.ts', "import { a, type B } from './a';", 99);
  assert.equal(isTypeOnlyImport(mixed.statements[0].importClause), false);
});
