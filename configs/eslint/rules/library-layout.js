import fs from 'node:fs';
import path from 'node:path';

// Library source vocabulary, applied recursively inside every library area. A module (an area,
// a named feature, or a helper module) holds index, types, constants, and either helpers.ts or
// a helpers/ container; features/ and helpers/ are containers whose children are modules.
// Test directories, test files, declaration files and generated folders are exempt.
const INDEX = /^index\.tsx?$/;
const MODULE_FILES = /^(index\.tsx?|types\.ts|constants\.ts|helpers\.tsx?)$/;
const CONTAINER_FILES = /^index\.tsx?$/;
const ROOT_FILES = /^(index\.tsx?|types\.ts|constants\.ts)$/;
const TEST_FILE = /\.(test|spec)\.[cm]?[jt]sx?$/;
const EXEMPT_DIRECTORIES = new Set(['__tests__', 'generated']);
const CONTAINERS = new Set(['features', 'helpers']);

/**
 * The first violation of the library grammar for one file, or `null`. `dirs` are the directory
 * names between the library source root and the file, and `base` is the file name.
 */
export function layoutViolation(dirs, base) {
  if (TEST_FILE.test(base) || base.endsWith('.d.ts')) return null;
  if (dirs.some((dir) => EXEMPT_DIRECTORIES.has(dir))) return null;
  let kind = 'root';
  for (const dir of dirs) {
    if (kind === 'root') {
      if (CONTAINERS.has(dir)) return `"${dir}/" must be inside an area`;
      kind = 'module';
    } else if (kind === 'module') {
      if (!CONTAINERS.has(dir)) {
        return `directory "${dir}/" is not allowed in a module; use features/ or helpers/`;
      }
      kind = 'container';
    } else {
      kind = 'module';
    }
  }
  if (kind === 'root') {
    return ROOT_FILES.test(base) ? null : `"${base}" is not allowed in the library source root`;
  }
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
      { type: 'object', properties: { src: { type: 'string' } }, additionalProperties: false },
    ],
    messages: { invalid: '{{message}}' },
  },
  create(context) {
    const src = path.resolve(context.options[0]?.src ?? path.join(process.cwd(), 'src'));
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
