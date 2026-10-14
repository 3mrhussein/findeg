// L1 runtime: what a package may assume about where it runs. A package picks exactly one
// runtime; the globals it gets and the modules it may not import follow from that choice.
import globals from 'globals';
import { CODE, TESTS } from '../globs.js';
import { severity } from '../standard.js';

export const RUNTIMES = {
  // Runs in browsers and Node alike: no host globals, no Node or framework modules.
  isomorphic: { globals: {}, forbid: ['node:*', 'next', 'next/**', 'react', 'react/**'] },
  // Server code: Node globals, no Next.js.
  node: { globals: globals.node, forbid: ['next', 'next/**'] },
  // Browser-only component library.
  browser: { globals: globals.browser, forbid: [] },
  // Next.js apps render on both sides of the wire.
  next: { globals: { ...globals.browser, ...globals.node }, forbid: [] },
};

/** @param {keyof typeof RUNTIMES} runtime */
export function runtimeLayer(runtime) {
  const { globals: runtimeGlobals, forbid } = RUNTIMES[runtime];
  // ESLint selectors cover forms no-restricted-imports does not visit.
  const forbiddenSource =
    runtime === 'isomorphic'
      ? String.raw`/^(node:|next($|\u002F)|react($|\u002F))/`
      : String.raw`/^next($|\u002F)/`;
  const restrictedSyntax = [
    `ImportExpression > Literal[value=${forbiddenSource}]`,
    `ImportExpression > TemplateLiteral > TemplateElement[value.cooked=${forbiddenSource}]`,
    `CallExpression[callee.name="require"] > Literal.arguments[value=${forbiddenSource}]`,
    `CallExpression[callee.name="require"] > TemplateLiteral.arguments > TemplateElement[value.cooked=${forbiddenSource}]`,
    `TSImportType Literal[value=${forbiddenSource}]`,
  ].map((selector) => ({ selector, message: `Module is unavailable in the ${runtime} runtime.` }));
  return [
    { files: CODE, languageOptions: { globals: runtimeGlobals } },
    ...(forbid.length
      ? [
          {
            files: CODE,
            ignores: TESTS,
            rules: {
              'no-restricted-imports': [severity('no-restricted-imports'), { patterns: forbid }],
              'no-restricted-syntax': [severity('no-restricted-syntax'), ...restrictedSyntax],
            },
          },
        ]
      : []),
  ];
}
