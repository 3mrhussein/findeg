import nextConfig from "eslint-config-next/core-web-vitals";

const config = [
  ...nextConfig,
  {
    extends: ["next/core-web-vitals", "plugin:prettier/recommended"],
    ignores: [".next/**", "node_modules/**"],
  },
];

export default config;
