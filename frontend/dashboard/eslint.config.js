import { createRequire } from 'node:module';
import { next } from '@findeg/config/eslint/next';

// eslint-plugin-react already ships as a dependency of eslint-config-next (a
// devDependency here); resolve it from there instead of adding a duplicate
// direct dependency.
const react = createRequire(import.meta.resolve('eslint-config-next'))('eslint-plugin-react');

export default [
  ...next,

  {
    // The dashboard is fully localized (README: "RTL & Theming Integrity"):
    // user-visible copy must come from `next-intl` messages, not hard-coded
    // JSX text. Children only — props/attributes (className, href, ...) are
    // not checked. The existing backlog is accepted in eslint-suppressions.json.
    files: ['src/**/*.tsx'],
    ignores: ['src/**/*.test.tsx'],
    plugins: { react },
    rules: {
      'react/jsx-no-literals': [
        'error',
        {
          // Also catches `{'Text'}` children, so wrapping a literal in braces
          // is not a way around the rule; ignoreProps keeps attributes exempt.
          noStrings: true,
          ignoreProps: true,
          // Language-neutral punctuation, separators and markers only (e.g. the
          // `*` required-field marker, `#` column header). Not allowlisted on
          // purpose: `,` (Arabic uses `،`), directional glyphs (`<`, `>`, `→`)
          // that must mirror in RTL, emoji, and currency codes like `EGP`.
          allowedStrings: [
            '—',
            '–',
            '·',
            '•',
            '|',
            '/',
            ':',
            '.',
            '(',
            ')',
            '*',
            '%',
            '+',
            '-',
            '×',
            '#',
          ],
        },
      ],
    },
  },
];
