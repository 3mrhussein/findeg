import { importSourceVisitors } from './import-sources.js';

// Rejects modules a package's target runtime cannot provide (for example `node:*` in an
// isomorphic package, or `next` in a Node service). Patterns are globs: `*` stays inside a
// path segment, `**` crosses segments. Declared in layers/runtime.js, one list per runtime.

function toRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `^${escaped
      .replace(/\*\*/g, '\u0000')
      .replace(/\*/g, '[^/]*')
      .replace(/\u0000/g, '.*')}$`,
  );
}

/** @type {import('eslint').Rule.RuleModule} */
export const runtimeImportsRule = {
  meta: {
    type: 'problem',
    docs: { description: "Disallow imports the package's target runtime cannot provide" },
    schema: [
      {
        type: 'object',
        properties: {
          runtime: { type: 'string' },
          patterns: { type: 'array', items: { type: 'string' } },
        },
        required: ['runtime', 'patterns'],
        additionalProperties: false,
      },
    ],
    messages: {
      unavailable: "'{{source}}' is not available in the {{runtime}} runtime this package targets.",
    },
  },
  create(context) {
    const { runtime, patterns } = context.options[0];
    const forbidden = patterns.map(toRegExp);
    return importSourceVisitors((node, source) => {
      if (typeof source === 'string' && forbidden.some((pattern) => pattern.test(source))) {
        context.report({ node, messageId: 'unavailable', data: { source, runtime } });
      }
    });
  },
};
