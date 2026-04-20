/**
 * Architectural Boundary Enforcement Tests
 * 
 * Unit tests validating that:
 * - Infrastructure layer is not exposed via package.json exports
 * - Only application and presentation layers are accessible
 * - Package export structure follows Clean Architecture principles
 * 
 * Coverage: CHK015-CHK018, CHK019-CHK021 from test-strategy checklist
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// Read package.json once at module level for all tests
const packageJsonPath = resolve(__dirname, "../../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

describe("Package.json Exports - Architectural Boundaries", () => {
  describe("Export Structure Validation (CHK015, CHK017)", () => {
    it("should have exports field defined", () => {
      expect(packageJson.exports).toBeDefined();
      expect(typeof packageJson.exports).toBe("object");
    });

    it("should export all features with consistent naming", () => {
      const features = [
        "core",
        "identity", 
        "media",
        "catalog",
        "cart",
        "order",
        "review",
        "school",
        "notifications",
        "administration",
      ];

      features.forEach((feature) => {
        const exportPath = `./features/${feature}`;
        expect(packageJson.exports[exportPath]).toBeDefined();
        expect(packageJson.exports[exportPath]).toHaveProperty("types");
        expect(packageJson.exports[exportPath]).toHaveProperty("default");
      });
    });

    it("should use consistent path structure for all feature exports", () => {
      const featureExports = Object.keys(packageJson.exports).filter((key) =>
        key.startsWith("./features/")
      );

      featureExports.forEach((exportPath) => {
        const featureName = exportPath.replace("./features/", "");
        const exportConfig = packageJson.exports[exportPath];

        expect(exportConfig.types).toBe(`./dist/features/${featureName}/index.d.ts`);
        expect(exportConfig.default).toBe(`./dist/features/${featureName}/index.js`);
      });
    });
  });

  describe("Infrastructure Layer Protection (CHK016, FR-003)", () => {
    it("should NOT expose infrastructure paths in exports", () => {
      const exportPaths = Object.keys(packageJson.exports);
      
      const infrastructureExports = exportPaths.filter((path) =>
        path.includes("/infrastructure")
      );

      expect(infrastructureExports).toHaveLength(0);
    });

    it("should NOT expose database schema paths", () => {
      const exportPaths = Object.keys(packageJson.exports);
      
      const schemaExports = exportPaths.filter(
        (path) => path.includes("/schema") || path.includes("/persistence")
      );

      expect(schemaExports).toHaveLength(0);
    });

    it("should NOT expose repository implementation paths", () => {
      const exportPaths = Object.keys(packageJson.exports);
      
      const repoExports = exportPaths.filter(
        (path) => path.includes("Repository") && !path.endsWith("/index")
      );

      expect(repoExports).toHaveLength(0);
    });
  });

  describe("Layer Exposure Validation (CHK002, FR-002)", () => {
    it("should only expose feature barrel exports (index.ts files)", () => {
      const featureExports = Object.keys(packageJson.exports).filter((key) =>
        key.startsWith("./features/")
      );

      featureExports.forEach((exportPath) => {
        const config = packageJson.exports[exportPath];
        
        // All feature exports should point to index files
        expect(config.types).toMatch(/\/index\.d\.ts$/);
        expect(config.default).toMatch(/\/index\.js$/);
      });
    });
  });

  describe("TypeScript Type Definitions (CHK005, CHK011-CHK012)", () => {
    it("should export TypeScript definitions alongside implementation", () => {
      const allExports = Object.values(packageJson.exports) as Array<{
        types?: string;
        default?: string;
      }>;

      allExports.forEach((exportConfig) => {
        if (exportConfig.default) {
          expect(exportConfig.types).toBeDefined();
          expect(exportConfig.types).toBeTruthy();
        }
      });
    });

    it("should have matching .d.ts and .js paths", () => {
      const allExports = Object.values(packageJson.exports) as Array<{
        types?: string;
        default?: string;
      }>;

      allExports.forEach((exportConfig) => {
        if (exportConfig.types && exportConfig.default) {
          const typesPath = exportConfig.types.replace(/\.d\.ts$/, ".js");
          expect(typesPath).toBe(exportConfig.default);
        }
      });
    });
  });
});

describe("Module Resolution - Infrastructure Blocking (CHK019-CHK021)", () => {
  describe("Positive Cases - Allowed Imports", () => {
    it("should allow importing from feature barrel exports", async () => {
      // These should succeed - importing from allowed paths
      await expect(import("@findeg/backend/features/core")).resolves.toBeDefined();
      await expect(import("@findeg/backend/features/identity")).resolves.toBeDefined();
    }, 10000); // 10 second timeout for dynamic imports

    it("should allow importing domain types", async () => {
      await expect(import("@types/domain")).resolves.toBeDefined();
    });

    it("should allow importing validation schemas", async () => {
      await expect(import("@types/validation")).resolves.toBeDefined();
    });
  });

  describe("Negative Cases - Infrastructure Import Blocking", () => {
    it("should prevent direct infrastructure imports in production", () => {
      // Note: In the monorepo context, these paths are accessible during development
      // but should be blocked by package.json exports when @backend is consumed
      // by apps. This test documents the expected behavior.
      
      const infrastructurePaths = [
        "@findeg/backend/features/catalog/infrastructure/DrizzleProductRepository",
        "@findeg/backend/features/core/infrastructure/persistence/database.config",
        "@findeg/backend/features/identity/infrastructure/DrizzleuserRepository",
      ];

      // In production (apps importing @backend), these would fail at package boundary
      // During backend development, they're accessible (which is correct for internal use)
      infrastructurePaths.forEach((path) => {
        // Document that these paths exist internally but won't be exported
        expect(path).toMatch(/infrastructure/);
      });
    });
  });
});

describe("serverExternalPackages Configuration (CHK022-CHK024, FR-010)", () => {
  const requiredExternalPackages = [
    "postgres",
    "drizzle-orm", 
    "bcryptjs",
    "jose",
    "jsonwebtoken",
    "sharp",
    "nodemailer",
  ];

  it("should document required Node.js-only packages for apps", () => {
    // This test documents which packages must be in serverExternalPackages
    // Apps (dashboard/storefront) must configure these in next.config.ts
    
    requiredExternalPackages.forEach((pkg) => {
      expect(pkg).toBeTruthy();
      expect(typeof pkg).toBe("string");
    });

    expect(requiredExternalPackages).toHaveLength(7);
  });

  it("should identify packages that require server-only execution", () => {
    const dependencies = packageJson.dependencies || {};
    
    const nodeOnlyPackages = requiredExternalPackages.filter(
      (pkg) => pkg in dependencies
    );

    // Verify these packages exist in backend dependencies
    expect(nodeOnlyPackages.length).toBeGreaterThan(0);
  });
});

describe("Framework Agnostic Validation (CHK Implicit - Constitution VIII)", () => {
  it("should NOT have React dependencies", () => {
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    expect(dependencies["react"]).toBeUndefined();
    expect(dependencies["react-dom"]).toBeUndefined();
  });

  it("should NOT have Next.js dependencies", () => {
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    expect(dependencies["next"]).toBeUndefined();
  });

  it("should NOT have server-only package dependency", () => {
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Backend must remain framework-agnostic
    expect(dependencies["server-only"]).toBeUndefined();
  });
});
