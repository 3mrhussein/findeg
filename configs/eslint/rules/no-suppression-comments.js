// Suppression directives hide a violation instead of fixing it, which defeats every other
// rule in the standard. Typed `@ts-expect-error` is allowed: it fails when the error is gone.
const DIRECTIVE = /^[\s*/]*(eslint-disable(?:-next-line|-line)?|@ts-ignore|@ts-nocheck)\b/;

/** @type {import('eslint').Rule.RuleModule} */
export const noSuppressionCommentsRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow comments that suppress lint or type checks' },
    schema: [],
    messages: {
      suppressed:
        "'{{directive}}' hides a violation. Fix the code; if the rule is wrong, change the standard in @findeg/config instead.",
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const match = DIRECTIVE.exec(comment.value);
          if (match) {
            context.report({
              loc: comment.loc,
              messageId: 'suppressed',
              data: { directive: match[1] },
            });
          }
        }
      },
    };
  },
};
