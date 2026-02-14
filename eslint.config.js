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
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
        },
      ],
    },
  },
];

export default config;
