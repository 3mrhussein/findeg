import { readdirSync } from 'node:fs';

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const features = readdirSync(new URL('./src/features/', import.meta.url), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const publicEntries = {
  core: ['schemas', 'logger', 'money', 'errors'],
  catalog: ['schemas'],
  order: ['schemas'],
  checkout: ['schemas'],
  'guest-access': ['schemas'],
  outbox: ['transaction'],
};

/** Restrict other features' internals while preserving same-feature implementation imports. */
export function restriction(feature, exceptions = []) {
  const others = features
    .filter((name) => name !== feature)
    .map((name) => {
      const entries = ['index', ...(publicEntries[name] ?? [])].map(escape).join('|');
      return `(?:@findeg/backend/features/${escape(name)}/|(?:\\.\\.?/)+(?:features/)?${escape(name)}/)(?!(?:${entries})(?:\\.[cm]?[jt]sx?)?$).+`;
    });
  const excluded = exceptions.length ? `(?!(?:${exceptions.map(escape).join('|')})$)` : '';
  return {
    regex: `^${excluded}(?:${others.join('|')})$`,
    message: 'Import another backend feature through its public entry point (ADR-0016).',
  };
}

export const dynamicInternalImports = {
  meta: {
    type: 'problem',
    schema: [{ type: 'string' }],
    messages: {
      internal: 'Import {{source}} through its feature public entry point (ADR-0016).',
    },
  },
  create(context) {
    const forbidden = new RegExp(context.options[0]);
    const check = (node, source) => {
      if (typeof source === 'string' && forbidden.test(source)) {
        context.report({ node, messageId: 'internal', data: { source } });
      }
    };
    return {
      ImportExpression(node) {
        check(node, node.source.value);
      },
      TSImportType(node) {
        check(node, node.source?.value ?? node.argument?.literal?.value ?? node.argument?.value);
      },
    };
  },
};

export function featureImportConfigs(allowlist) {
  const options = (feature, exceptions = []) => [
    'error',
    {
      patterns: [
        { group: ['@findeg/dashboard/**', '@findeg/storefront/**', '@findeg/ui/**', 'next/**'] },
        restriction(feature, exceptions),
      ],
    },
  ];
  const rules = (feature, exceptions = []) => ({
    'no-restricted-imports': options(feature, exceptions),
    'featureImports/no-dynamic-internals': ['error', restriction(feature, exceptions).regex],
  });
  return [
    { plugins: { featureImports: { rules: { 'no-dynamic-internals': dynamicInternalImports } } } },
    ...features.map((feature) => ({
      files: [`src/features/${feature}/**/*.{ts,tsx,js,mjs}`],
      rules: rules(feature),
    })),
    ...Object.entries(allowlist).map(([file, exceptions]) => ({
      files: [file],
      rules: rules(file.split('/')[2], exceptions),
    })),
  ];
}
