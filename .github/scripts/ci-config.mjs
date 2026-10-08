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
export const EXEMPT_BRANCH_NAMES = ['main', 'develop'];

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
 * RegExp pattern matchers for branches eligible for caching and the fast tier.
 * Matches against head or target branch names (e.g. '^develop$', '^docs:.*', '^feat/').
 * Branches NOT matching any pattern (e.g. 'main') run the strict tier from scratch without cache.
 */
export const APPLY_CACHE_BRANCH_PATTERNS = [
  '^develop$',
  '^docs:.*',
  '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)/',
];

/** The production release gate branch. */
export const RELEASE_GATE_BRANCH = 'main';

/** The branch designated as the single cache producer on push. */
export const CACHE_PRODUCER_BRANCH = 'develop';

/**
 * Centralized CI configuration object aggregating all constants.
 */
export const ciConfig = {
  conventionalCommitTypes: CONVENTIONAL_COMMIT_TYPES,
  branchOnlyTypes: BRANCH_ONLY_TYPES,
  exemptBranchNames: EXEMPT_BRANCH_NAMES,
  exemptBranchPrefixes: EXEMPT_BRANCH_PREFIXES,
  allowedMainTargetSources: ALLOWED_MAIN_TARGET_SOURCES,
  ciWorkflowDefinitionPaths: CI_WORKFLOW_DEFINITION_PATHS,
  integrationTestTriggerPaths: INTEGRATION_TEST_TRIGGER_PATHS,
  nonCodePathPrefixes: NON_CODE_PATH_PREFIXES,
  nonCodePathSuffixes: NON_CODE_PATH_SUFFIXES,
  applyCache: APPLY_CACHE_BRANCH_PATTERNS,
  releaseBranch: RELEASE_GATE_BRANCH,
  cacheProducerBranch: CACHE_PRODUCER_BRANCH,
};

// Backwards-compatible alias
export const config = ciConfig;
