import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Local executable-test placement is checked from a reporter's onInit, which runs before
// Vitest's file collection; globalSetup is skipped when no test files exist (--passWithNoTests).
function source(file) {
  return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
}
function implementation(file) {
  return source(file).statements.some((statement) => {
    if (
      ts.isImportDeclaration(statement) ||
      ts.isExportDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isEmptyStatement(statement)
    )
      return false;
    if (statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword))
      return false;
    return true;
  });
}
function executable(file) {
  const tree = source(file);
  const names = new Set(['test', 'it']);
  for (const statement of tree.statements) {
    if (ts.isImportDeclaration(statement) && statement.moduleSpecifier.text === 'vitest') {
      const bindings = statement.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const binding of bindings.elements) {
          if (['test', 'it'].includes(binding.propertyName?.text ?? binding.name.text))
            names.add(binding.name.text);
        }
      }
    }
  }
  function testCall(expression) {
    if (ts.isIdentifier(expression)) return names.has(expression.text);
    if (ts.isPropertyAccessExpression(expression))
      return (
        ['only', 'each', 'for', 'concurrent', 'sequential'].includes(expression.name.text) &&
        testCall(expression.expression)
      );
    if (ts.isCallExpression(expression)) return testCall(expression.expression);
    return false;
  }
  let found = false;
  function visit(node) {
    if (ts.isCallExpression(node) && testCall(node.expression) && node.arguments.length >= 2)
      found = true;
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return found;
}
function localTests(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? localTests(file)
      : /\.[cm]?[jt]sx?$/.test(file) && !file.endsWith('.d.ts')
        ? [file]
        : [];
  });
}
function files(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory())
      return ['__tests__', 'node_modules', 'generated'].includes(entry.name) ? [] : files(file);
    return /\.(ts|tsx|js|jsx|mts|cts)$/.test(file) &&
      !/(\.d\.ts|\.(test|spec)\.[^.]+|\/(constants|types)\.ts)$/.test(file)
      ? [file]
      : [];
  });
}
export function placementReporter({ enabled, library, measure }) {
  return {
    name: 'findeg-placement',
    onInit(vitest) {
      if (!(enabled || measure) || !library) return;
      const root = vitest.config.root;
      const directories = new Set(
        files(path.join(root, 'src'))
          .filter(implementation)
          .map((file) => path.dirname(file)),
      );
      const missing = [...directories].filter((directory) => {
        const tests = path.join(directory, '__tests__');
        return !localTests(tests).some(executable);
      });
      if (missing.length) {
        const message = `FindEg: implementation directories require local executable __tests__: ${missing.map((directory) => path.relative(root, directory)).join(', ')}`;
        if (enabled) throw new Error(message);
        console.warn(message);
      }
    },
  };
}
