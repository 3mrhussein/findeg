import { fileURLToPath } from 'node:url';
import { libraryScopes } from '../../../configs/library-scopes.mjs';
import fs from 'node:fs';
import path from 'node:path';

// Recursive source modules use features/ and helpers/ containers; named modules live
// inside those containers. Test directories and declaration filenames are exempt.
const INDEX = /^index\.tsx?$/;
const MODULE_FILES = /^(index\.tsx?|types\.ts|constants\.ts|helpers\.tsx?)$/;
const CONTAINER_FILES = /^index\.tsx?$/;
const TEST_FILE = /\.(test|spec)\.[cm]?[jt]sx?$/;
const CONTAINERS = new Set(['features', 'helpers']);

/**
 * The first violation of the library grammar for one file, or `null`. `dirs` are the directory
 * names between the library source root and the file, and `base` is the file name.
 */
export function layoutViolation(dirs, base) {
  let kind = 'module';
  for (const dir of dirs) {
    if (dir === '__tests__') return null;
    if (kind === 'module') {
      if (!CONTAINERS.has(dir)) {
        return `directory "${dir}/" is not allowed in a module; use features/ or helpers/`;
      }
      kind = 'container';
    } else {
      kind = 'module';
    }
  }
  if (TEST_FILE.test(base) || base.endsWith('.d.ts')) return null;
  if (kind === 'container') {
    return CONTAINER_FILES.test(base)
      ? null
      : `"${base}" is not allowed in ${dirs.at(-1)}/; it may only hold module directories and index`;
  }
  return MODULE_FILES.test(base)
    ? null
    : `"${base}" is not an allowed library filename (index, types, constants, helpers)`;
}

export const libraryLayoutRule = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: { src: { type: 'string' }, scoped: { type: 'boolean' } },
        additionalProperties: false,
      },
    ],
    messages: { invalid: '{{message}}' },
  },
  create(context) {
    let src = path.resolve(context.options[0]?.src ?? path.join(process.cwd(), 'src'));
    if (context.options[0]?.scoped) {
      const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
      const filename = path.resolve(context.filename);
      const roots = Object.entries(libraryScopes).flatMap(([workspace, scopes]) =>
        scopes.map((scope) => path.join(repoRoot, workspace, scope)),
      );
      const owner = roots.find((root) => filename.startsWith(`${root}${path.sep}`));
      if (!owner) return {};
      src = owner;
    }
    return {
      Program(node) {
        const relative = path.relative(src, path.resolve(context.filename));
        if (relative.startsWith('..')) return;
        const segments = relative.split(path.sep);
        const base = segments.pop();
        let message = layoutViolation(segments, base);
        const directory = path.join(src, ...segments);
        if (!message && /^helpers\.tsx?$/.test(base)) {
          if (fs.existsSync(path.join(directory, 'helpers'))) {
            message = 'helpers.ts and helpers/ cannot both exist in one module';
          } else if (!fs.readdirSync(directory).some((entry) => INDEX.test(entry))) {
            message = 'a module with helpers.ts needs an index.ts entry';
          }
        }
        if (message) {
          context.report({
            node,
            loc: { line: 1, column: 0 },
            messageId: 'invalid',
            data: { message: `${relative}: ${message}` },
          });
        }
      },
    };
  },
};
