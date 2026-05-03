import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      DATABASE_URL: "postgres://localhost/findeg_test",
      DB_USER: "postgres",
      DB_PASSWORD: "password",
      DB_NAME: "findeg_test",
      JWT_SECRET: "test-secret-key-12345678901234567890",
      JWT_REFRESH_SECRET: "test-refresh-secret-key-12345678901234567890",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/index.ts", // index files are just re-exports
      ],
    },
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
      "@features": resolve(import.meta.dirname, "./src/features"),
      "@findeg/backend": resolve(import.meta.dirname, "./src"),
      "@lib": resolve(import.meta.dirname, "./src/lib"),
      "@types/validation": resolve(
        import.meta.dirname,
        "./src/features/core/domain/types/validation",
      ),
      "@types/domain": resolve(import.meta.dirname, "./src/features/core/domain/types"),
      "@findeg/env": resolve(import.meta.dirname, "../env.ts"),
    },
  },
});
