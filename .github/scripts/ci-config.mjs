// CI pipeline configuration: central definition of branch conventions,
// file paths, and cache rules for all GitHub Actions workflows and local git hooks.

export const CONVENTIONAL_COMMIT_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];

/** `hotfix` is a branch-only prefix: hotfix commits and PR titles still use `fix:`. */
export const BRANCH_ONLY_TYPES = ['hotfix'];

/** Long-lived repository branches exempt from the branch naming rule. */
export const EXEMPT_BRANCH_NAMES = ['main', 'develop', 'ci-evidence'];

/** Branch name prefixes created by automated tooling rather than developers. */
export const EXEMPT_BRANCH_PREFIXES = ['release-please--', 'dependabot/', 'worktree-'];

/** Only these head branches may open a pull request targeting the release gate branch (`main`). */
export const ALLOWED_MAIN_TARGET_SOURCES = {
  exactBranches: ['develop'],
  prefixes: ['hotfix/', 'release-please--'],
};

/**
 * Workflow and CI definition files. Any change touching these files forces
 * a full code-check run (lint, type-check, unit tests, build).
 */
export const CI_WORKFLOW_DEFINITION_PATHS = [
  '.github/workflows/ci.yml',
  '.github/workflows/ci-release.yml',
  '.github/workflows/ci-jobs.yml',
  '.github/workflows/pr-conventions.yml',
  '.github/actions/',
  '.github/scripts/',
];

/**
 * Paths that trigger the Postgres-backed integration test suite.
 * Includes database, backend services, environment packages, and root configurations.
 */
export const INTEGRATION_TEST_TRIGGER_PATHS = [
  'backend/',
  'db/',
  'packages/env/',
  'pnpm-lock.yaml',
  'package.json',
  'turbo.json',
  '.nvmrc',
  'docker-compose.yml',
];

/**
 * Path prefixes and suffixes that represent non-code changes (documentation, agent prompts, etc.).
 * When a PR touches ONLY these paths, code checks (lint, build, tests) are safely skipped.
 */
export const NON_CODE_PATH_PREFIXES = ['docs/', '.github/', '.claude/', '.agents/', '.agent/'];
export const NON_CODE_PATH_SUFFIXES = ['.md'];

/**
 * Branches eligible for the fast tier (caches restored), matched against a PR's head or target:
 * develop and conventional feature branches. Anything else (e.g. 'main') runs strict.
 */
export const FAST_TIER_BRANCH_PATTERNS = [
  '^develop$',
  `^(${CONVENTIONAL_COMMIT_TYPES.join('|')})/`,
];

/** The production release gate branch. */
export const RELEASE_GATE_BRANCH = 'main';

/** The branch designated as the single cache producer on push. */
export const CACHE_PRODUCER_BRANCH = 'develop';
