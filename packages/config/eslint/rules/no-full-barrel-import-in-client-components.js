// Custom rule (not a published plugin — registered inline as the "local"
// plugin in next.js) blocking Client Components from importing a feature's
// client-safe schema *values* from the full `@findeg/backend/features/<feature>`
// barrel instead of its `<feature>/schemas` entry point. Only schema value
// imports are restricted — type-only imports (erased at compile time) carry
// no bundle risk and stay allowed, matching PR #128's precedent of importing
// plain types (e.g. `Collection`) from the main barrel alongside schemas
// from `catalog/schemas`.
//
// The generic no-restricted-imports rule can't express this: it has no
// notion of "only inside 'use client' files, and only for these specific
// value exports" — the full barrel import itself is fine outside a Client
// Component (Server Components/route handlers need the service factory), and
// fine inside one when only importing types. See
// docs/adr/0001-backend-feature-barrels.md.

/**
 * @param {Record<string, string[]>} schemaExportNamesByFeature Feature name -> the schema value export names its `<feature>/schemas` entry point provides.
 * @returns {import('eslint').Rule.RuleModule}
 */
export function createNoFullBarrelImportInClientComponentsRule(schemaExportNamesByFeature) {
  const schemaNamesBySource = new Map(
    Object.entries(schemaExportNamesByFeature).map(([feature, names]) => [
      `@findeg/backend/features/${feature}`,
      new Set(names),
    ]),
  );

  return {
    meta: {
      type: 'problem',
      docs: {
        description:
          "Disallow importing a feature's client-safe schema values from its full backend barrel in a Client Component; import them from the feature's schemas entry point instead.",
      },
      schema: [],
      messages: {
        useSchemasEntryPoint:
          "'{{imported}}' is a client-safe schema re-exported by '{{source}}', which also re-exports the service factory that transitively imports 'db/src/connection.ts' and breaks the client bundle. Import '{{imported}}' from '{{source}}/schemas' instead.",
      },
    },
    create(context) {
      let isClientComponent = false;

      return {
        Program(node) {
          const firstStatement = node.body[0];
          isClientComponent =
            firstStatement !== undefined &&
            firstStatement.type === 'ExpressionStatement' &&
            firstStatement.directive === 'use client';
        },
        ImportDeclaration(node) {
          if (!isClientComponent) return;
          if (node.importKind === 'type') return;

          const source = node.source.value;
          const schemaNames =
            typeof source === 'string' ? schemaNamesBySource.get(source) : undefined;
          if (!schemaNames) return;

          for (const specifier of node.specifiers) {
            if (specifier.type !== 'ImportSpecifier') continue;
            if (specifier.importKind === 'type') continue;

            const importedName =
              specifier.imported.type === 'Identifier'
                ? specifier.imported.name
                : specifier.imported.value;
            if (schemaNames.has(importedName)) {
              context.report({
                node: specifier,
                messageId: 'useSchemasEntryPoint',
                data: { imported: importedName, source },
              });
            }
          }
        },
      };
    },
  };
}
