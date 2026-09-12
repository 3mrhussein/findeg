import { dirname, relative, resolve } from 'node:path';
import ts from 'typescript';

export const businessModules = [
  'identity-access',
  'partner-management',
  'catalog',
  'school-supply-lists',
  'inventory',
  'commerce',
  'partner-rewards',
  'partner-reports',
];
const owners = new Set([...businessModules, 'runtime']);
const databaseLibrary = /^(?:@findeg\/db(?:\/|$)|drizzle-orm(?:\/|$)|postgres$|pg$)/;

function ownerOf(path) {
  return /^(?:backend|db)\/src\/modules\/([^/]+)\//.exec(path)?.[1];
}

/** Parse syntax rather than text so multiline/type-only imports and comments are unambiguous. */
function onlyTransactionType(node) {
  if (ts.isImportDeclaration(node)) {
    const clause = node.importClause;
    return (
      !!clause &&
      !clause.name &&
      !!clause.namedBindings &&
      ts.isNamedImports(clause.namedBindings) &&
      clause.namedBindings.elements.length > 0 &&
      clause.namedBindings.elements.every(
        (element) =>
          (clause.isTypeOnly || element.isTypeOnly) &&
          (element.propertyName ?? element.name).text === 'TransactionDatabase',
      )
    );
  }
  if (ts.isExportDeclaration(node)) {
    return (
      !!node.exportClause &&
      ts.isNamedExports(node.exportClause) &&
      node.exportClause.elements.length > 0 &&
      node.exportClause.elements.every(
        (element) =>
          (node.isTypeOnly || element.isTypeOnly) &&
          (element.propertyName ?? element.name).text === 'TransactionDatabase',
      )
    );
  }
  return (
    ts.isImportTypeNode(node) &&
    !node.isTypeOf &&
    !!node.qualifier &&
    ts.isIdentifier(node.qualifier) &&
    node.qualifier.text === 'TransactionDatabase'
  );
}

function importsIn(path, contents) {
  const source = ts.createSourceFile(path, contents, ts.ScriptTarget.Latest, true);
  const imports = [];
  function add(specifier, node) {
    imports.push({
      specifier: specifier && ts.isStringLiteralLike(specifier) ? specifier.text : null,
      transactionTypeOnly: onlyTransactionType(node),
    });
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier) add(node.moduleSpecifier, node);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      add(node.moduleReference.expression, node);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      add(node.argument.literal, node);
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    )
      add(node.arguments[0], node);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return imports;
}

function resolveImport(root, path, imported, configurations) {
  const configPath = ts.findConfigFile(dirname(resolve(root, path)), ts.sys.fileExists);
  let options = { moduleResolution: ts.ModuleResolutionKind.Bundler };
  if (configPath && !relative(root, configPath).startsWith('..')) {
    if (!configurations.has(configPath)) {
      const config = ts.readConfigFile(configPath, ts.sys.readFile);
      configurations.set(
        configPath,
        ts.parseJsonConfigFileContent(config.config, ts.sys, dirname(configPath)).options,
      );
    }
    options = configurations.get(configPath);
  }
  const resolved = ts.resolveModuleName(
    imported,
    resolve(root, path),
    options,
    ts.sys,
  ).resolvedModule;
  let target = resolved ? relative(root, resolved.resolvedFileName) : null;
  if (!target && imported.startsWith('.'))
    target = relative(root, resolve(root, dirname(path), imported));
  if (!target && imported.startsWith('@findeg/backend/modules/')) {
    target = imported.replace('@findeg/backend/', 'backend/src/') + '/public.ts';
  }
  if (!target && imported.startsWith('@findeg/db/modules/')) {
    target = imported.replace('@findeg/db/', 'db/src/') + '/schema.ts';
  }
  return target?.replace(/^(backend|db)\/dist\//, '$1/src/').replace(/\.d\.ts$/, '.ts');
}

export function checkModuleBoundaries(root, sources) {
  const violations = [];
  const graph = new Map();
  const configurations = new Map();
  for (const [path, contents] of sources) {
    if (!/\.[cm]?[jt]sx?$/.test(path)) continue;
    const owner = ownerOf(path);
    if (owner && !owners.has(owner)) violations.push(`Unknown module owner: ${path}`);
    const targetBusiness = path.startsWith('backend/src/modules/');
    const application = path.startsWith('backend/src/application/');
    const infrastructure = path.includes('/infrastructure/');
    const persistence = path.startsWith('db/src/modules/');
    for (const { specifier: imported, transactionTypeOnly } of importsIn(path, contents)) {
      if (imported === null) {
        if (owner || application) violations.push(`Nonliteral module dependency: ${path}`);
        continue;
      }
      const target = resolveImport(root, path, imported, configurations) ?? '';
      const targetOwner = ownerOf(target);
      // Pool/driver creation belongs to runtime, never an owner-scoped adapter.
      let forbidden =
        !!owner &&
        (imported === 'postgres' ||
          imported === 'pg' ||
          (imported.startsWith('drizzle-orm/') && imported !== 'drizzle-orm/pg-core'));
      if (
        owner &&
        (imported === '@findeg/db/transactions' || target === 'db/src/runtime/transactions.ts') &&
        !transactionTypeOnly
      )
        forbidden = true;
      if (owner && targetOwner && owner !== targetOwner) {
        if (!graph.has(owner)) graph.set(owner, new Set());
        graph.get(owner).add(targetOwner);
        forbidden ||=
          persistence ||
          !/^backend\/src\/modules\/[^/]+\/(?:public|contracts)\.[cm]?[jt]s$/.test(target);
      }
      if (targetBusiness || application) {
        const database = databaseLibrary.test(imported) || target.startsWith('db/');
        forbidden ||=
          (!infrastructure && database) ||
          imported === 'next' ||
          imported.startsWith('next/') ||
          imported.startsWith('@findeg/runtime') ||
          target.startsWith('runtime/');
        if (infrastructure && imported === '@findeg/db/transactions' && !transactionTypeOnly)
          forbidden = true;
        // Owner persistence factories may use only their own schema and the transaction construction type.
        if (infrastructure && (imported.startsWith('@findeg/db') || target.startsWith('db/'))) {
          forbidden ||=
            target !== `db/src/modules/${owner}/schema.ts` &&
            imported !== '@findeg/db/transactions';
        }
        // Legacy helpers can hide forbidden dependencies; target operations use target surfaces exclusively.
        if (
          target.startsWith('backend/src/') &&
          !target.startsWith('backend/src/modules/') &&
          !target.startsWith('backend/src/application/')
        )
          forbidden = true;
        if (!infrastructure && target.includes('/infrastructure/')) forbidden = true;
        if (application && targetOwner && !/\/(?:public|contracts)\.[cm]?[jt]s$/.test(target))
          forbidden = true;
      }
      if (
        targetBusiness &&
        target.startsWith('backend/src/application/') &&
        target !== 'backend/src/application/transactions.ts'
      )
        forbidden = true;
      if (persistence) {
        if (target.startsWith('db/src/')) {
          const ownMapping = target.startsWith(`db/src/modules/${owner}/`);
          const legacySchemaBridge =
            path.endsWith('/schema.ts') && target.startsWith('db/src/schema/');
          forbidden ||=
            !ownMapping && !legacySchemaBridge && target !== 'db/src/runtime/transactions.ts';
        }
        forbidden ||=
          target.startsWith('backend/') ||
          target.startsWith('runtime/') ||
          imported.startsWith('@findeg/backend') ||
          imported.startsWith('@findeg/runtime');
        // Only the declared schema construction surface may bridge the retained legacy mapping.
        if (target.startsWith('db/src/schema/')) forbidden ||= !path.endsWith('/schema.ts');
      }
      if (path.startsWith('frontend/')) {
        forbidden ||=
          target.startsWith('db/') ||
          (target.startsWith('backend/') && target.includes('/infrastructure/'));
        if (targetOwner) forbidden ||= !target.endsWith('/contracts.ts');
      }
      if (path.startsWith('db/')) forbidden ||= target.startsWith('backend/');
      if (forbidden) violations.push(`Prohibited module dependency: ${path} imports ${imported}`);
    }
  }
  const visited = new Set();
  const active = [];
  function visit(owner) {
    if (active.includes(owner)) {
      violations.push(
        `Module dependency cycle: ${[...active.slice(active.indexOf(owner)), owner].join(' -> ')}`,
      );
      return;
    }
    if (visited.has(owner)) return;
    active.push(owner);
    for (const dependency of [...(graph.get(owner) ?? [])].sort()) visit(dependency);
    active.pop();
    visited.add(owner);
  }
  for (const owner of [...graph.keys()].sort()) visit(owner);
  return [...new Set(violations)].sort();
}
