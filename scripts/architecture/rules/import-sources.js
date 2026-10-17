// Shared visitor for every rule that inspects module specifiers: static imports, re-exports,
// dynamic imports, `require` and TypeScript import types all reach the same callback, so a
// boundary cannot be bypassed by switching syntax.

function typeImportSource(node) {
  if (node.source?.type === 'Literal') return node.source.value;
  if (node.source?.type === 'StringLiteral') return node.source.value;
  if (node.source?.type === 'TSLiteralType' && node.source.literal?.type === 'Literal') {
    return node.source.literal.value;
  }
  return undefined;
}

function literalValue(node) {
  if (node?.type === 'Literal') return node.value;
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0].value.cooked;
  }
  return undefined;
}

/**
 * @param {(node: import('estree').Node, source: unknown) => void} check
 * @returns {import('eslint').Rule.RuleListener}
 */
export function importSourceVisitors(check) {
  return {
    ImportDeclaration(node) {
      check(node, node.source.value);
    },
    ExportNamedDeclaration(node) {
      check(node, node.source?.value);
    },
    ExportAllDeclaration(node) {
      check(node, node.source.value);
    },
    ImportExpression(node) {
      check(node, literalValue(node.source));
    },
    'CallExpression[callee.name="require"]'(node) {
      check(node, literalValue(node.arguments[0]));
    },
    TSImportType(node) {
      check(node, typeImportSource(node));
    },
  };
}
