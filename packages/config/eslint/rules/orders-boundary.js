import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { importSourceVisitors } from './import-sources.js';

const repoRoot = path.resolve(fileURLToPath(new URL('../../../..', import.meta.url)));
const ordersRoots = [
  path.join(repoRoot, 'packages/orders/src'),
  path.join(repoRoot, 'backend/src/features/order'),
];
const inside = (file, root) => file === root || file.startsWith(`${root}${path.sep}`);

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

    const inOrders = inside(filename, packageOwner);
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
      if (
        source === '@findeg/backend/features/order' ||
        source.startsWith('@findeg/backend/features/order/')
      ) {
        context.report({ node, messageId: 'deep' });
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
      if (
        inOrders &&
        ['backend', 'frontend'].some((directory) =>
          inside(resolved, path.join(repoRoot, directory)),
        )
      ) {
        context.report({ node, messageId: 'forbidden' });
        return;
      }
      const targetIsInternal = ordersRoots.some((root) => inside(resolved, root));
      const fromSameOwner = ordersRoots.some(
        (root) => inside(filename, root) && inside(resolved, root),
      );
      if (targetIsInternal && !fromSameOwner) {
        context.report({ node, messageId: 'relative' });
      }
    }

    return importSourceVisitors(check);
  },
};
