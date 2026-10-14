import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import ts from 'typescript';

const domainDirectory = fileURLToPath(new URL('../../../packages/domain/', import.meta.url));

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
  // Public subpaths can export different arrays under the same name (especially default).
  // Preserve each exported set rather than letting a later entry overwrite an earlier one.
  const sets = [];
  function entryPoints(value) {
    if (typeof value === 'string') {
      for (const [name, values] of exportsOf(resolveSource(domainDirectory, value)))
        sets.push([name, new Set(values)]);
    } else if (value && typeof value === 'object') {
      for (const entry of Object.values(value)) entryPoints(entry);
    }
  }
  entryPoints(manifest.exports);
  return sets;
}
const domainSets = readDomainSets();

// Public Domain types are resolved through TypeScript's real export graph, including
// renamed exports and indexed-access aliases. Do not maintain a second value registry.
function readDomainMetadata() {
  const manifest = JSON.parse(fs.readFileSync(path.join(domainDirectory, 'package.json'), 'utf8'));
  const entries = [];
  function collect(value) {
    if (typeof value === 'string') entries.push(resolveSource(domainDirectory, value));
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  }
  collect(manifest.exports);
  const program = ts.createProgram(entries, {
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    skipLibCheck: true,
    types: [],
  });
  const checker = program.getTypeChecker();
  const types = new Map();
  const constants = [];
  for (const entry of entries) {
    const source = program.getSourceFile(entry);
    for (const symbol of checker.getExportsOfModule(checker.getSymbolAtLocation(source))) {
      const target =
        symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      if (target.flags & ts.SymbolFlags.Variable) {
        const declaration = target.valueDeclaration;
        let initializer = declaration?.initializer;
        while (
          initializer &&
          (ts.isAsExpression(initializer) || ts.isSatisfiesExpression(initializer))
        )
          initializer = initializer.expression;
        if (
          initializer &&
          (ts.isStringLiteral(initializer) ||
            ts.isNumericLiteral(initializer) ||
            ts.isRegularExpressionLiteral(initializer))
        ) {
          constants.push({
            name: symbol.name,
            value: initializer.text,
            numeric: ts.isNumericLiteral(initializer),
            regexp: ts.isRegularExpressionLiteral(initializer),
          });
        } else if (
          initializer &&
          ts.isCallExpression(initializer) &&
          initializer.arguments.length === 1 &&
          ts.isStringLiteral(initializer.arguments[0])
        ) {
          constants.push({
            name: symbol.name,
            value: initializer.arguments[0].text,
            factory: initializer.expression.getText(),
          });
        } else if (initializer && ts.isIdentifier(initializer)) {
          const type = checker.getTypeOfSymbolAtLocation(target, declaration);
          if (type.isNumberLiteral() || type.isStringLiteral())
            constants.push({
              name: symbol.name,
              value: String(type.value),
              numeric: type.isNumberLiteral(),
            });
        }
      }
      if (!(target.flags & ts.SymbolFlags.TypeAlias)) continue;
      const type = checker.getDeclaredTypeOfSymbol(target);
      const members = type.isUnion() ? type.types : [type];
      if (members.every((member) => member.isStringLiteral()))
        types.set(symbol.name, new Set(members.map((member) => member.value)));
    }
  }
  return { types, constants };
}
let domainMetadata;
function metadata() {
  return (domainMetadata ??= readDomainMetadata());
}

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
    schema: [
      {
        type: 'object',
        properties: { deriveNeverRedefine: { type: 'boolean' } },
        additionalProperties: false,
      },
    ],
    messages: {
      copy: 'Use {{name}} from @findeg/domain instead of copying its domain values.',
      constant: 'Derive {{name}} from @findeg/domain instead of hard-coding a business constant.',
      map: 'Supply every {{name}} value with satisfies Record<{{name}}, …>; do not use Partial, assertions or literal-key copies.',
    },
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
    const extended = context.options[0]?.deriveNeverRedefine !== false;
    const { types: domainTypes, constants: domainConstants } = extended
      ? metadata()
      : { types: new Map(), constants: [] };
    const importedTypes = new Map();
    const aliases = new Map();
    const namespaces = new Set();
    const importedValues = new Map();
    for (const statement of context.sourceCode.ast.body) {
      if (
        statement.type === 'ImportDeclaration' &&
        /^@findeg\/domain(?:\/|$)/.test(statement.source.value)
      ) {
        for (const binding of statement.specifiers) {
          if (binding.type === 'ImportNamespaceSpecifier') namespaces.add(binding.local.name);
          else if (binding.type === 'ImportSpecifier') {
            const name = binding.imported.name ?? binding.imported.value;
            importedValues.set(binding.local.name, name);
            if (domainTypes.has(name)) importedTypes.set(binding.local.name, name);
          }
        }
      }
      const declaration =
        statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
      if (declaration?.type === 'TSTypeAliasDeclaration')
        aliases.set(declaration.id.name, declaration.typeAnnotation);
    }
    function domainType(node, seen = new Set()) {
      if (
        node?.type === 'TSIndexedAccessType' &&
        node.indexType.type === 'TSNumberKeyword' &&
        node.objectType.type === 'TSTypeQuery'
      ) {
        const query = node.objectType.exprName;
        const exported =
          query.type === 'Identifier'
            ? importedValues.get(query.name)
            : query.type === 'TSQualifiedName' && namespaces.has(query.left.name)
              ? query.right.name
              : null;
        const values = domainSets.find(([name]) => name === exported)?.[1];
        if (values)
          return (
            [...domainTypes].find(
              ([, type]) =>
                type.size === values.size && [...type].every((value) => values.has(value)),
            )?.[0] ?? null
          );
        return null;
      }
      if (node?.type !== 'TSTypeReference') return null;
      const name = node.typeName;
      if (name.type === 'TSQualifiedName' && namespaces.has(name.left.name))
        return domainTypes.has(name.right.name) ? name.right.name : null;
      if (name.type !== 'Identifier' || seen.has(name.name)) return null;
      if (importedTypes.has(name.name)) return importedTypes.get(name.name);
      seen.add(name.name);
      return domainType(aliases.get(name.name), seen);
    }
    function recordType(node, seen = new Set()) {
      if (node?.type === 'TSMappedType')
        return domainType(node.constraint ?? node.typeParameter?.constraint);
      if (node?.type !== 'TSTypeReference') return null;
      if (aliases.has(node.typeName.name) && !seen.has(node.typeName.name)) {
        seen.add(node.typeName.name);
        return recordType(aliases.get(node.typeName.name), seen);
      }
      const args = node.typeArguments?.params ?? node.typeParameters?.params;
      if (node.typeName.name === 'Record') return domainType(args?.[0]);
      if (['Partial', 'Readonly'].includes(node.typeName.name)) return recordType(args?.[0], seen);
      return null;
    }
    function mapAnnotation(node) {
      let wrapper = node;
      let annotation;
      let satisfies = false;
      let asserted = false;
      while (['TSAsExpression', 'TSSatisfiesExpression'].includes(wrapper.parent?.type)) {
        wrapper = wrapper.parent;
        if (wrapper.type === 'TSSatisfiesExpression') {
          annotation = wrapper.typeAnnotation;
          satisfies = true;
        } else if (wrapper.typeAnnotation.typeName?.name !== 'const') asserted = true;
      }
      annotation ??=
        wrapper.parent?.type === 'VariableDeclarator'
          ? wrapper.parent.id.typeAnnotation?.typeAnnotation
          : undefined;
      if (
        !annotation &&
        wrapper.parent?.type === 'Property' &&
        wrapper.parent.parent.type === 'ObjectExpression'
      ) {
        const outer = mapAnnotation(wrapper.parent.parent);
        const args =
          outer.annotation?.typeArguments?.params ?? outer.annotation?.typeParameters?.params;
        if (outer.annotation?.typeName?.name === 'Record')
          return { annotation: args?.[1], satisfies: outer.satisfies, asserted: outer.asserted };
      }
      return { annotation, satisfies, asserted };
    }
    function objectMap(node) {
      const { annotation, satisfies, asserted } = mapAnnotation(node);
      const name = recordType(annotation);
      const keys = node.properties.map((property) =>
        property.type === 'Property' && !property.computed
          ? (property.key.name ?? property.key.value)
          : null,
      );
      const values = keys.every((key) => typeof key === 'string') ? keys : null;
      if (name) {
        const expected = domainTypes.get(name);
        const args = annotation?.typeArguments?.params ?? annotation?.typeParameters?.params;
        const isRecord = annotation.typeName?.name === 'Record' && args?.length === 2;
        if (
          satisfies &&
          !asserted &&
          isRecord &&
          values &&
          values.length === expected.size &&
          new Set(values).size === expected.size &&
          values.every((value) => expected.has(value))
        )
          return;
        context.report({ node, messageId: 'map', data: { name } });
      } else {
        // A small untyped subset cannot be identified globally (active is also an
        // ordinary property). An imported Domain type supplies that missing context.
        const matching =
          values?.length &&
          [...importedTypes.values()].find((type) =>
            values.every((value) => domainTypes.get(type).has(value)),
          );
        if (matching) context.report({ node, messageId: 'map', data: { name: matching } });
        else report(node, values);
      }
    }
    function report(node, values) {
      if (!values) return;
      const candidate = new Set(values);
      for (const [name, owner] of extended ? [...domainSets, ...domainTypes] : domainSets) {
        if (
          (candidate.size === owner.size || candidate.size >= 3) &&
          [...candidate].every((value) => owner.has(value))
        ) {
          context.report({ node, messageId: 'copy', data: { name } });
          return;
        }
      }
    }
    const normalized = (name) =>
      typeof name === 'string' ? name.replaceAll('_', '').toLowerCase() : undefined;
    const constantNames = new Map(
      domainConstants.map((constant) => [normalized(constant.name), constant]),
    );
    // Prefixes such as FLAT_SHIPPING_FEE describe the Domain policy, not a reason
    // for an infrastructure layer to redeclare it as shippingFee.
    for (const constant of domainConstants) {
      const name = normalized(constant.name).replace(/^(?:flat|default|business)/, '');
      if (name !== normalized(constant.name)) constantNames.set(name, constant);
    }
    function hardcoded(node, value = node.value) {
      if (!extended) return;
      let wrapper = node;
      while (['TSAsExpression', 'TSSatisfiesExpression'].includes(wrapper.parent?.type))
        wrapper = wrapper.parent;
      let parent = wrapper.parent;
      if (['CallExpression', 'NewExpression'].includes(parent?.type)) {
        wrapper = parent;
        while (['TSAsExpression', 'TSSatisfiesExpression'].includes(wrapper.parent?.type))
          wrapper = wrapper.parent;
        parent = wrapper.parent;
      }
      const binding =
        parent?.type === 'VariableDeclarator'
          ? parent.id.name
          : parent?.type === 'Property' && parent.value === wrapper
            ? (parent.key.name ?? parent.key.value)
            : null;
      let constant = constantNames.get(normalized(binding));
      constant ??= domainConstants.find((owner) => {
        if (owner.factory) {
          const call = node.parent;
          return (
            call?.type === 'CallExpression' &&
            (importedValues.get(call.callee.name) ?? call.callee.name) === owner.factory &&
            value === owner.value &&
            /fee|shipping/i.test(binding ?? '')
          );
        }
        if (owner.numeric) return false; // 1, 5, etc. have unrelated technical uses.
        if (owner.regexp)
          return node.regex && `/${node.regex.pattern}/${node.regex.flags}` === owner.value;
        return (
          typeof value === 'string' &&
          value === owner.value &&
          !domainSets.some(([, values]) => values.has(owner.value))
        );
      });
      if (
        !constant &&
        node.parent?.type === 'BinaryExpression' &&
        ['<', '<=', '>', '>='].includes(node.parent.operator)
      ) {
        const other = node.parent.left === node ? node.parent.right : node.parent.left;
        const name =
          other.type === 'Identifier'
            ? other.name
            : other.type === 'MemberExpression'
              ? other.property.name
              : '';
        if (/stock/i.test(name))
          constant = domainConstants.find(
            (owner) => owner.name === 'LOW_STOCK_MAX_UNITS' && Number(owner.value) === value,
          );
      }
      if (constant) context.report({ node, messageId: 'constant', data: { name: constant.name } });
    }
    function sql(node, text) {
      for (const values of sqlLists(text)) report(node, values);
    }
    return {
      ObjectExpression(node) {
        if (extended) objectMap(node);
      },
      TSAsExpression(node) {
        if (!extended) return;
        let expression = node.expression;
        while (['TSAsExpression', 'TSSatisfiesExpression'].includes(expression.type))
          expression = expression.expression;
        // Object literals are reported at the map seam, avoiding duplicate errors.
        if (expression.type === 'ObjectExpression') return;
        const name = recordType(node.typeAnnotation);
        if (name) context.report({ node, messageId: 'map', data: { name } });
      },
      NewExpression(node) {
        if (!extended || !['Map', 'Set'].includes(node.callee.name)) return;
        const args = node.typeArguments?.params ?? node.typeParameters?.params;
        const name = domainType(args?.[0]);
        const pairs = node.arguments[0];
        if (!name && node.callee.name === 'Map' && pairs?.type === 'ArrayExpression') {
          const keys = pairs.elements.map((pair) =>
            pair?.type === 'ArrayExpression' ? pair.elements[0] : null,
          );
          report(node, stringValues(keys));
        }
        if (name) context.report({ node, messageId: 'map', data: { name } });
      },
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
        hardcoded(node);
        if (typeof node.value === 'string') sql(node, node.value);
      },
      TemplateLiteral(node) {
        if (!node.expressions.length)
          hardcoded(node, node.quasis[0].value.cooked ?? node.quasis[0].value.raw);
        // Keep interpolation boundaries: a dynamic expression inside a list must never
        // turn its neighbouring quoted fragments into an apparently complete literal set.
        sql(node, node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join('\u0000'));
      },
    };
  },
};
