import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, test } from "node:test";

const temporaryRoots = [];
const executeFile = promisify(execFile);

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })));
});

async function createTargetRepository() {
  const root = await mkdtemp(join(tmpdir(), "findeg-architecture-check-"));
  temporaryRoots.push(root);

  await Promise.all([
    mkdir(join(root, "docs/architecture"), { recursive: true }),
    mkdir(join(root, "docs/adr"), { recursive: true }),
    mkdir(join(root, "docs/contracts/openapi"), { recursive: true }),
    mkdir(join(root, "docs/operations"), { recursive: true }),
    mkdir(join(root, "frontend/storefront/src"), { recursive: true }),
    mkdir(join(root, "backend/src/features/catalog"), { recursive: true }),
    mkdir(join(root, "db/src"), { recursive: true }),
  ]);

  await Promise.all([
    writeFile(join(root, "CONTEXT.md"), "# FindEg\n"),
    writeFile(join(root, "docs/architecture/README.md"), "# Target architecture\n"),
    writeFile(join(root, "docs/adr/0001-target-architecture.md"), "# ADR\n"),
    writeFile(join(root, "docs/contracts/openapi/v1.yaml"), "openapi: 3.1.0\n"),
    writeFile(join(root, "docs/operations/README.md"), "# Operations\n"),
    writeFile(join(root, "docs/package-guidance.md"), "# Package guidance\n"),
  ]);

  return root;
}

function runArchitectureCheck(root) {
  return executeFile(process.execPath, ["scripts/architecture-check.mjs", "--root", root], {
    cwd: process.cwd(),
  });
}

test("accepts the canonical documentation set without prohibited dependencies", async () => {
  const root = await createTargetRepository();

  const result = await runArchitectureCheck(root);
  assert.equal(result.stderr, "");
});

test("reports documentation drift and prohibited module dependencies", async () => {
  const root = await createTargetRepository();
  await Promise.all([
    rm(join(root, "docs/contracts/openapi/v1.yaml")),
    writeFile(join(root, "frontend/storefront/src/products.ts"), 'import "@findeg/db";\n'),
    writeFile(join(root, "frontend/storefront/src/catalog.ts"), 'import { repository } from "@findeg/backend/features/catalog/infrastructure";\n'),
    writeFile(join(root, "backend/src/features/catalog/cache.ts"), 'export { cache } from "next/cache";\n'),
    writeFile(join(root, "db/src/queries.ts"), 'await import("@findeg/backend");\n'),
  ]);

  await assert.rejects(runArchitectureCheck(root), (error) => {
    assert.equal(error.code, 1);
    assert.deepEqual(error.stderr.trim().split("\n"), [
    "Missing canonical documentation: docs/contracts/openapi/v1.yaml",
    "Prohibited dependency: backend/src/features/catalog/cache.ts imports next/cache",
    "Prohibited dependency: db/src/queries.ts imports @findeg/backend",
    "Prohibited dependency: frontend/storefront/src/catalog.ts imports @findeg/backend/features/catalog/infrastructure",
    "Prohibited dependency: frontend/storefront/src/products.ts imports @findeg/db",
    ]);
    return true;
  });
});
