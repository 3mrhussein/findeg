const camelCase = /^[a-z][a-zA-Z0-9]*$/;
const upperSnakeCase = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;
const pascalCase = /^[A-Z][a-zA-Z0-9]*$/;

// Only local binding names are checked. Property/member keys are external contracts.
export const naming = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: { invalid: '{{name}} must use {{format}}.' },
  },
  create(context) {
    const services = context.sourceCode.parserServices;
    const checker = services.program?.getTypeChecker();
    const tsx = context.filename.endsWith('.tsx');
    function typeOf(node) {
      return checker?.getTypeAtLocation(services.esTreeNodeToTSNodeMap.get(node));
    }
    function callable(node, seen = new Set()) {
      if (checker) {
        const type = typeOf(node);
        return (type.isUnion() ? type.types : [type]).some(
          (part) => part.getCallSignatures().length > 0,
        );
      }
      if (seen.has(node.name)) return false;
      seen.add(node.name);
      let scope = context.sourceCode.getScope(node);
      let variable;
      while (scope && !variable) {
        variable = scope.variables.find((entry) => entry.name === node.name);
        scope = scope.upper;
      }
      const definition = variable?.defs[0];
      if (definition?.type === 'FunctionName') return true;
      const init = definition?.node?.init;
      return (
        init?.type === 'ArrowFunctionExpression' ||
        init?.type === 'FunctionExpression' ||
        (init?.type === 'Identifier' && callable(init, seen))
      );
    }
    function component(node) {
      if (!tsx || !checker) return false;
      const type = typeOf(node);
      // Resolve aliases and React wrappers through their public TypeScript signatures.
      // React's declared return types also cover components returning null conditionally.
      function reactResult(result) {
        const symbol = result.aliasSymbol ?? result.getSymbol();
        const name = symbol?.getName();
        const declaredByReact = symbol?.declarations?.some((declaration) =>
          /[/\\]@types[/\\]react[/\\]/.test(declaration.getSourceFile().fileName),
        );
        if (declaredByReact && ['Element', 'ReactElement', 'ReactNode'].includes(name)) return true;
        return result.isUnion() && result.types.some(reactResult);
      }
      return type.getCallSignatures().some((signature) => reactResult(signature.getReturnType()));
    }
    function check(node, category) {
      if (!node || node.type !== 'Identifier') return;
      const format =
        category === 'component'
          ? 'camelCase or PascalCase'
          : category === 'type'
            ? 'PascalCase'
            : category === 'function'
              ? 'camelCase'
              : 'camelCase or UPPER_SNAKE_CASE';
      const valid =
        category === 'component'
          ? camelCase.test(node.name) || pascalCase.test(node.name)
          : category === 'type'
            ? pascalCase.test(node.name)
            : category === 'function'
              ? camelCase.test(node.name)
              : camelCase.test(node.name) || upperSnakeCase.test(node.name);
      if (!valid) context.report({ node, messageId: 'invalid', data: { name: node.name, format } });
    }
    // React contexts carry a call signature through their Provider; they are values, not functions.
    function isContext(node) {
      const type = typeOf(node);
      return Boolean(type?.getProperty('Provider') && type.getProperty('Consumer'));
    }
    function classValue(node) {
      const symbol = typeOf(node)?.getSymbol();
      return Boolean(typeOf(node)?.getConstructSignatures().length && symbol && symbol.flags & 32);
    }
    function value(node, constant) {
      if (classValue(node)) check(node, 'type');
      else if (isContext(node)) {
        if (constant) check(node, 'constant');
      } else if (callable(node)) check(node, component(node) ? 'component' : 'function');
      else if (constant) check(node, 'constant');
    }
    function binding(node, constant) {
      if (node.type === 'Identifier') value(node, constant);
      else if (node.type === 'ObjectPattern') {
        for (const property of node.properties)
          binding(property.type === 'RestElement' ? property.argument : property.value, constant);
      } else if (node.type === 'ArrayPattern') {
        for (const element of node.elements) if (element) binding(element, constant);
      } else if (node.type === 'AssignmentPattern') binding(node.left, constant);
      else if (node.type === 'RestElement') binding(node.argument, constant);
    }
    return {
      VariableDeclarator(node) {
        binding(node.id, node.parent.kind === 'const');
      },
      FunctionDeclaration(node) {
        check(node.id, node.id && component(node.id) ? 'component' : 'function');
      },
      TSDeclareFunction(node) {
        check(node.id, node.id && component(node.id) ? 'component' : 'function');
      },
      FunctionExpression(node) {
        check(node.id, node.id && component(node.id) ? 'component' : 'function');
      },
      TSTypeAliasDeclaration(node) {
        check(node.id, 'type');
      },
      TSInterfaceDeclaration(node) {
        check(node.id, 'type');
      },
      TSEnumDeclaration(node) {
        check(node.id, 'type');
      },
      ClassDeclaration(node) {
        check(node.id, 'type');
      },
      ClassExpression(node) {
        check(node.id, 'type');
      },
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          let symbol = checker?.getSymbolAtLocation(
            services.esTreeNodeToTSNodeMap.get(specifier.local),
          );
          if (symbol && symbol.flags & 2097152) symbol = checker.getAliasedSymbol(symbol);
          // Type-only imports may reference values via typeof; classify the exported symbol.
          const typeOnly = node.importKind === 'type' || specifier.importKind === 'type';
          if (
            (typeOnly && symbol && symbol.flags & (32 | 64 | 128 | 256 | 524288)) ||
            (symbol && !(symbol.flags & 111551)) ||
            classValue(specifier.local)
          )
            check(specifier.local, 'type');
          else value(specifier.local, true);
        }
      },
    };
  },
};
