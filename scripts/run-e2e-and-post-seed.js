/**
 * Runs Cypress tests and always re-seeds the DB after the run finishes.
 *
 * Behavior:
 * 1) Run `cypress run` with provided CLI args
 *    - If `--spec` is not provided, run all specs in deterministic order:
 *      a) `cypress/e2e/shop/**`
 *      b) `cypress/e2e/admin/**`
 *      c) remaining specs
 * 2) Always run `npm run db:seed` afterward (pass/fail)
 * 3) Preserve Cypress failure exit code
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function bin(name) {
  return process.platform === "win32" ? `${name}.cmd` : name;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    console.error(`❌ Failed to execute: ${command} ${args.join(" ")}`);
    console.error(result.error);
    return 1;
  }

  return typeof result.status === "number" ? result.status : 1;
}

const SPEC_FLAG = "--spec";
const E2E_ROOT = path.resolve("cypress/e2e");
const SPEC_EXTENSIONS = [".cy.ts", ".cy.tsx"];

function collectSpecFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const specs = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      specs.push(...collectSpecFiles(fullPath));
      continue;
    }

    if (SPEC_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      specs.push(path.relative(process.cwd(), fullPath).replaceAll(path.sep, "/"));
    }
  }

  return specs;
}

function orderWeight(specPath) {
  if (specPath.startsWith("cypress/e2e/shop/")) return 0;
  if (specPath.startsWith("cypress/e2e/admin/")) return 1;
  return 2;
}

function buildOrderedSpecList() {
  const all = collectSpecFiles(E2E_ROOT);
  return all
    .sort((a, b) => {
      const weightDiff = orderWeight(a) - orderWeight(b);
      if (weightDiff !== 0) return weightDiff;
      return a.localeCompare(b);
    })
    .join(",");
}

const cliArgs = process.argv.slice(2);
const hasExplicitSpec = cliArgs.some((arg) => arg === SPEC_FLAG || arg.startsWith(`${SPEC_FLAG}=`));
const cypressArgs = [...cliArgs];

if (!hasExplicitSpec) {
  const orderedSpecs = buildOrderedSpecList();
  if (orderedSpecs) {
    console.log("▶ Running specs in deterministic order (shop -> admin -> remaining)");
    cypressArgs.push(SPEC_FLAG, orderedSpecs);
  }
}

const cypressExit = run(bin("npx"), ["cypress", "run", ...cypressArgs]);

console.log("\n♻️  Re-seeding database after E2E run...");
const seedExit = run(bin("npm"), ["run", "db:seed"]);

if (cypressExit !== 0) {
  process.exit(cypressExit);
}

if (seedExit !== 0) {
  process.exit(seedExit);
}

process.exit(0);
