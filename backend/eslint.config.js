/**
 * Backend ESLint Configuration
 *
 * Enforces that @backend remains a pure TypeScript library
 * with no dependencies on Next.js framework APIs.
 */
import jsdoc from "eslint-plugin-jsdoc";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const config = [
  prettierRecommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    files: ["src/**/*.{js,ts,jsx,tsx}"],
    plugins: {
      jsdoc,
    },
    ignores: ["dist/**", "node_modules/**"],
    rules: {
      /**
       * CRITICAL: Prevent Next.js framework imports in backend package.
       * Backend must be pure TypeScript/Node.js to:
       * - Run unit tests in pure Node.js environment (Vitest)
       * - Enable framework portability
       * - Maintain Clean Architecture separation
       *
       * App-layer (dashboard, storefront) handles framework integration:
       * - Cache revalidation (revalidatePath, revalidateTag)
       * - Navigation (redirect, notFound)
       * - Cookie/session management
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
            {
              group: ["react", "react/*"],
              message:
                "❌ React imports are not allowed in @backend. " +
                "Backend must have no UI dependencies. " +
                "Use @ui in app packages instead.",
            },
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
    },
  },
];

export default config;
