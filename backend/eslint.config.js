/**
 * Backend ESLint Configuration
 *
 * Enforces that @backend remains a pure TypeScript library
 * with no dependencies on Next.js framework APIs.
 */
import jsdoc from "eslint-plugin-jsdoc";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const config = tseslint.config(
  prettierRecommended,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    files: ["src/**/*.{js,ts,jsx,tsx}"],
    plugins: {
      jsdoc,
      "@typescript-eslint": tsPlugin,
    },
    ignores: ["dist/**", "node_modules/**"],
    rules: {
      /**
       * CRITICAL: Prevent Next.js framework imports in backend package.
       * Backend must be pure TypeScript/Node.js to:
       * - Run unit tests in pure Node.js environment (Vitest)
       * - Enable framework portability
       * - Maintain Clean Architecture separation
       */
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next", "next/*"],
              message:
                "❌ Next.js imports are not allowed in @backend. " +
                "Backend must be pure TypeScript/Node.js. " +
                "Move framework integration to @dashboard or @storefront.",
            },
            // {
            //   group: ["react", "react/*"],
            //   message:
            //     "❌ React imports are not allowed in @backend. " +
            //     "Backend must have no UI dependencies. " +
            //     "Use @ui in app packages instead.",
            // },
          ],
        },
      ],
      "jsdoc/check-alignment": "warn",
      "jsdoc/check-syntax": "warn",
      "jsdoc/check-tag-names": "warn",
      "jsdoc/no-undefined-types": "warn",
      "jsdoc/check-types": "warn",
      "jsdoc/check-values": "warn",
      "jsdoc/no-multi-asterisks": "warn",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "enum",
          format: ["PascalCase"],
        },
        {
          selector: "variable",
          modifiers: ["global", "const"],
          types: ["string", "number", "boolean", "array"],
          format: ["UPPER_CASE"],
        },
        {
          selector: "variable",
          modifiers: ["global", "const"],
          format: ["PascalCase"],
          filter: {
            regex: "Schema$",
            match: true,
          },
        },
      ],
    },
  },
  {
    files: ["src/features/notifications/infrastructure/templates/*.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
);

export default config;
