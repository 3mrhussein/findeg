import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('../../../..', import.meta.url)));
const ordersRoots = [
  path.join(repoRoot, 'packages/orders/src'),
  path.join(repoRoot, 'backend/src/features/order'),
];
const inside = (file, root) => file === root || file.startsWith(`${root}${path.sep}`);

function sourceFor(node) {
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

export const ordersBoundaryRule = {
  meta: {
    type: 'problem',
    docs: { description: 'enforce the Orders package public boundary' },
    schema: [],
    messages: {
      deep: 'Import Orders through its public package entry (@findeg/orders, /schemas, or /events).',
      forbidden: 'The Orders package cannot depend on Backend, applications, or Next.js.',
      relative: 'Do not bypass the Orders public package through a relative filesystem import.',
    },
  },
  create(context) {
    const filename = path.resolve(context.filename ?? context.getFilename());
    const packageOwner = path.join(repoRoot, 'packages/orders');
    const legacyOwner = path.join(repoRoot, 'backend/src/features/order');
    const inOrders = inside(filename, packageOwner) || inside(filename, legacyOwner);
    const currentDirectory = path.dirname(filename);

    function check(node, source) {
      if (typeof source !== 'string') return;
      const inExtractedPackage = inside(filename, packageOwner);
      if (
        inOrders &&
        ((inExtractedPackage &&
          /^@findeg\/(backend|dashboard|storefront|ui)(?:\/|$)/.test(source)) ||
          /^@findeg\/(dashboard|storefront|ui)(?:\/|$)/.test(source) ||
          source === 'next' ||
          source.startsWith('next/'))
      ) {
        context.report({ node, messageId: 'forbidden' });
        return;
      }
      if (source.startsWith('@findeg/backend/features/order/')) {
        if (source === '@findeg/backend/features/order/schemas') return;
        const legacyInternal =
          source.startsWith('@findeg/backend/features/order/') && inside(filename, legacyOwner);
        if (!legacyInternal) context.report({ node, messageId: 'deep' });
        return;
      }
      if (
        source === '@findeg/orders' ||
        source === '@findeg/orders/schemas' ||
        source === '@findeg/orders/events'
      )
        return;
      if (source.startsWith('@findeg/orders/')) {
        context.report({ node, messageId: 'deep' });
        return;
      }
      if (!source.startsWith('.')) return;
      const resolved = path.resolve(currentDirectory, source);
      const targetIsInternal = ordersRoots.some((root) => inside(resolved, root));
      const fromSameOwner = ordersRoots.some(
        (root) => inside(filename, root) && inside(resolved, root),
      );
      const legacyBackendBridge =
        inside(filename, path.join(repoRoot, 'backend/src')) &&
        inside(resolved, path.join(repoRoot, 'backend/src/features/order'));
      if (targetIsInternal && !fromSameOwner && !legacyBackendBridge) {
        context.report({ node, messageId: 'relative' });
      }
    }

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
        check(node, sourceFor(node));
      },
    };
  },
};
