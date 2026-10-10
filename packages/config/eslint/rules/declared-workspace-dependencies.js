import fs from 'node:fs';
import path from 'node:path';
import { importSourceVisitors } from './import-sources.js';

// A package may import a sibling workspace package only if its own package.json declares it.
// The manifest is the dependency contract: this keeps tsconfig path aliases and hoisting from
// creating edges that the package graph (and Turborepo's task graph) cannot see.
// Nothing here is specific to this repo: the scope is taken from the linted package's own name.

const manifests = new Map();

function manifestFor(directory) {
  if (manifests.has(directory)) return manifests.get(directory);
  let result = null;
  const file = path.join(directory, 'package.json');
  if (fs.existsSync(file)) {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    result = {
      name: json.name,
      declared: new Set(
        ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'].flatMap(
          (field) => Object.keys(json[field] ?? {}),
        ),
      ),
    };
  } else if (path.dirname(directory) !== directory) {
    result = manifestFor(path.dirname(directory));
  }
  manifests.set(directory, result);
  return result;
}

/** @type {import('eslint').Rule.RuleModule} */
export const declaredWorkspaceDependenciesRule = {
  meta: {
    type: 'problem',
    docs: {
      description: "Require imports of workspace packages to be declared in the package's manifest",
    },
    schema: [],
    messages: {
      undeclared:
        "'{{imported}}' is a workspace package that '{{owner}}' does not declare in package.json. Declare the dependency or remove the import; do not rely on a path alias.",
    },
  },
  create(context) {
    const manifest = manifestFor(path.dirname(path.resolve(context.filename)));
    if (!manifest?.name?.startsWith('@')) return {};
    const scope = `${manifest.name.split('/')[0]}/`;

    return importSourceVisitors((node, source) => {
      if (typeof source !== 'string' || !source.startsWith(scope)) return;
      const imported = source.split('/').slice(0, 2).join('/');
      if (imported === manifest.name || manifest.declared.has(imported)) return;
      context.report({ node, messageId: 'undeclared', data: { imported, owner: manifest.name } });
    });
  },
};
