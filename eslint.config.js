/**
 * JSDoc Philosophy:
 * We do NOT enforce JSDoc comments via ESLint.
 * TypeScript types and signatures are the primary documentation.
 *
 * Write comments ONLY when the WHY is not obvious from the code:
 *   ✅ Business rules that aren't obvious from the type signature
 *   ✅ Architectural contracts ("import from here, never reimplement")
 *   ✅ Non-obvious side effects or performance considerations
 *   ✅ @example blocks for complex utility functions
 *   ✅ Warning comments for dangerous operations
 *
 * NEVER write comments that repeat what the code already says:
 *   ❌ [doc] Returns the value [doc]  → obvious from the getter
 *   ❌ [doc] The user's email [doc]   → obvious from the property name
 *   ❌ [doc] @param id The id [doc]   → obvious from the parameter name
 *   ❌ Empty JSDoc blocks             → pure noise
 */
import nextConfig from "eslint-config-next/core-web-vitals";
import jsdoc from "eslint-plugin-jsdoc";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const config = [
  ...nextConfig,
  prettierRecommended,
  {
    plugins: {
      jsdoc,
    },
    ignores: [".next/**", "node_modules/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@/presentation/storefront/*", "src/presentation/storefront/*"],
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
