// Custom rule for `package.json` files (linted through @eslint/json): every workspace package
// must define the common scripts below, so `turbo run <script>` behaves the same everywhere.
// A package with nothing to test still defines `test` (e.g. `vitest --run --passWithNoTests`).

export const REQUIRED_PACKAGE_SCRIPTS = ['lint', 'type-check', 'test', 'clean'];

/** @type {import('eslint').Rule.RuleModule} */
export const requiredPackageScriptsRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Require the common scripts in every workspace package.json' },
    schema: [],
    messages: {
      missing: 'package.json must define the "{{script}}" script.',
    },
  },
  create(context) {
    return {
      Document(node) {
        const root = node.body;
        if (root.type !== 'Object') return;
        const member = (object, name) =>
          object.members.find((m) => m.name.type === 'String' && m.name.value === name);
        const scripts = member(root, 'scripts');
        const defined =
          scripts?.value.type === 'Object'
            ? new Set(scripts.value.members.map((m) => m.name.value))
            : new Set();
        for (const script of REQUIRED_PACKAGE_SCRIPTS) {
          if (!defined.has(script)) {
            context.report({
              node: (scripts ?? root).value ?? root,
              messageId: 'missing',
              data: { script },
            });
          }
        }
      },
    };
  },
};
