import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const domainDirectory = fileURLToPath(new URL('../../../domain/', import.meta.url));

function resolveSource(directory, specifier) {
  const base = path.resolve(directory, specifier);
  const file = [base, `${base}.ts`, path.join(base, 'index.ts')].find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  );
  if (!file) throw new Error(`Cannot resolve domain export ${specifier} from ${directory}`);
  return file;
}

function stringValues(node) {
  if (
    !node?.length ||
    !node.every((item) => item?.type === 'Literal' && typeof item.value === 'string')
  )
    return null;
  return node.map((item) => item.value);
}

function constValues(node) {
  let constant = false;
  while (node?.type === 'TSAsExpression' || node?.type === 'TSSatisfiesExpression') {
    if (
      node.type === 'TSAsExpression' &&
      node.typeAnnotation.type === 'TSTypeReference' &&
      node.typeAnnotation.typeName.name === 'const'
    )
      constant = true;
    node = node.expression;
  }
  return constant && node?.type === 'ArrayExpression' ? stringValues(node.elements) : null;
}

// Read the package's public entry points, then follow their export graph. Config already
// supplies the TS parser; no dependency from config to domain (or vice versa) is added.
function readDomainSets() {
  const manifest = JSON.parse(fs.readFileSync(path.join(domainDirectory, 'package.json'), 'utf8'));
  const modules = new Map();
  function exportsOf(file) {
    if (modules.has(file)) return modules.get(file);
    const exported = new Map();
    modules.set(file, exported);
    const ast = tseslint.parser.parseForESLint(fs.readFileSync(file, 'utf8'), {
      sourceType: 'module',
      loc: false,
      range: false,
    }).ast;
    const locals = new Map();
    for (const statement of ast.body) {
      const declaration =
        statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
      if (declaration?.type === 'VariableDeclaration') {
        for (const variable of declaration.declarations) {
          if (variable.id.type !== 'Identifier') continue;
          const values = constValues(variable.init);
          if (values) locals.set(variable.id.name, values);
        }
      }
      if (statement.type === 'ImportDeclaration' && statement.source.value.startsWith('.')) {
        const source = exportsOf(resolveSource(path.dirname(file), statement.source.value));
        for (const binding of statement.specifiers) {
          const imported =
            binding.type === 'ImportDefaultSpecifier'
              ? 'default'
              : binding.type === 'ImportSpecifier'
                ? (binding.imported.name ?? binding.imported.value)
                : null;
          if (
            statement.importKind !== 'type' &&
            binding.importKind !== 'type' &&
            source.has(imported)
          )
            locals.set(binding.local.name, source.get(imported));
        }
      }
    }
    for (const statement of ast.body) {
      if (statement.type === 'ExportAllDeclaration' && statement.exportKind !== 'type') {
        for (const [name, values] of exportsOf(
          resolveSource(path.dirname(file), statement.source.value),
        ))
          if (name !== 'default') exported.set(name, values);
      } else if (statement.type === 'ExportDefaultDeclaration') {
        const declaration = statement.declaration;
        const values =
          declaration.type === 'Identifier'
            ? locals.get(declaration.name)
            : constValues(declaration);
        if (values) exported.set('default', values);
      } else if (statement.type === 'ExportNamedDeclaration' && statement.exportKind !== 'type') {
        if (statement.declaration?.type === 'VariableDeclaration') {
          for (const variable of statement.declaration.declarations) {
            if (locals.has(variable.id.name))
              exported.set(variable.id.name, locals.get(variable.id.name));
          }
        }
        const source = statement.source
          ? exportsOf(resolveSource(path.dirname(file), statement.source.value))
          : locals;
        for (const binding of statement.specifiers) {
          const local = binding.local.name ?? binding.local.value;
          const name = binding.exported.name ?? binding.exported.value;
          if (binding.exportKind !== 'type' && source.has(local))
            exported.set(name, source.get(local));
        }
      }
    }
    return exported;
  }
  const sets = new Map();
  function entryPoints(value) {
    if (typeof value === 'string') {
      for (const [name, values] of exportsOf(resolveSource(domainDirectory, value)))
        sets.set(name, new Set(values));
    } else if (value && typeof value === 'object') {
      for (const entry of Object.values(value)) entryPoints(entry);
    }
  }
  entryPoints(manifest.exports);
  return sets;
}
const domainSets = readDomainSets();

// A SQL IN list must contain only quoted strings. Parse quoted tokens, including SQL's
// doubled quote escape, instead of splitting on commas (which may occur inside a value).
function sqlLists(text) {
  const lists = [];
  for (const match of text.matchAll(/\bin\b/gi)) {
    let cursor = match.index + match[0].length;
    const values = [];
    const whitespace = () => {
      while (cursor < text.length) {
        if (/\s/.test(text[cursor])) cursor++;
        else if (text.startsWith('/*', cursor)) {
          const end = text.indexOf('*/', cursor + 2);
          cursor = end === -1 ? text.length : end + 2;
        } else if (text.startsWith('--', cursor)) {
          const end = text.indexOf('\n', cursor + 2);
          cursor = end === -1 ? text.length : end + 1;
        } else break;
      }
    };
    whitespace();
    if (text[cursor++] !== '(') continue;
    while (cursor < text.length) {
      whitespace();
      if (text[cursor++] !== "'") break;
      let value = '';
      let closed = false;
      while (cursor < text.length) {
        const character = text[cursor++];
        if (character !== "'") value += character;
        else if (text[cursor] === "'") {
          value += "'";
          cursor++;
        } else {
          closed = true;
          break;
        }
      }
      if (!closed) break;
      values.push(value);
      whitespace();
      if (text[cursor] === ')') {
        lists.push(values);
        break;
      }
      if (text[cursor++] !== ',') break;
    }
  }
  return lists;
}

export const noDomainValueSetCopiesRule = {
  meta: {
    type: 'problem',
    schema: [],
    messages: { copy: 'Use {{name}} from @findeg/domain instead of copying its domain values.' },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/');
    const ownerRelative = path.relative(domainDirectory, context.filename);
    if (
      (!ownerRelative.startsWith('..') && !path.isAbsolute(ownerRelative)) ||
      /(?:^|\/)(?:__tests__|tests?|specs?|testing|fixtures?|migrations?)(?:\/|$)/.test(filename) ||
      /\.(?:test|spec|cy)\.[cm]?[jt]sx?$/.test(filename) ||
      /(?:^|\/)cypress\/(?:e2e|integration|specs)\//i.test(filename)
    )
      return {};
    function report(node, values) {
      if (!values) return;
      const candidate = new Set(values);
      for (const [name, owner] of domainSets) {
        if (
          (candidate.size === owner.size || candidate.size >= 3) &&
          [...candidate].every((value) => owner.has(value))
        ) {
          context.report({ node, messageId: 'copy', data: { name } });
          return;
        }
      }
    }
    function sql(node, text) {
      for (const values of sqlLists(text)) report(node, values);
    }
    return {
      ArrayExpression(node) {
        report(node, stringValues(node.elements));
      },
      TSUnionType(node) {
        const literals = (type) =>
          type.type === 'TSUnionType'
            ? type.types.flatMap(literals)
            : [type.type === 'TSLiteralType' ? type.literal : null];
        report(node, stringValues(literals(node)));
      },
      Literal(node) {
        if (typeof node.value === 'string') sql(node, node.value);
      },
      TemplateLiteral(node) {
        // Keep interpolation boundaries: a dynamic expression inside a list must never
        // turn its neighbouring quoted fragments into an apparently complete literal set.
        sql(node, node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join('\u0000'));
      },
    };
  },
};
