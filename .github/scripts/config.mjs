// CI pipeline config, consumed by policy.mjs and (optionally) workflow YAML via
// node .github/scripts/cli.mjs.  All values are plain primitives or arrays so
// they can be serialised to GITHUB_OUTPUT without a build step.

export const config = {
  // ── Branching & Conventional Commits ───────────────────────────────────────

  /** Conventional Commits types, matching commitlint.config.js and the PR title check. */
  commitTypes: [
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
  ],

  /** `hotfix` is a branch type only: hotfix commits and PR titles still use `fix:`. */
  branchOnlyTypes: ['hotfix'],

  /** Long-lived branches exempt from the naming rule. */
  exemptBranches: ['main', 'develop'],

  /** Branch name prefixes created by tooling, not by a person. */
  exemptPrefixes: ['release-please--', 'dependabot/', 'worktree-'],

  // ── Branches that may target `main` directly ────────────────────────────────
  /** Only these heads may open a PR into main. */
  allowedMainSources: {
    exact: ['develop'],
    prefixes: ['hotfix/', 'release-please--'],
  },

  // ── Path-based CI job selection ─────────────────────────────────────────────

  /**
   * Workflow files that always count as code even though they live under
   * .github/.  A change here forces a full code-check run.
   */
  ciPaths: [
    '.github/workflows/ci.yml',
    '.github/workflows/ci-release.yml',
    '.github/workflows/ci-jobs.yml',
    '.github/actions/',
    '.github/scripts/',
  ],

  /**
   * Paths that trigger the Postgres-backed integration suite.  Includes the CI
   * definitions themselves so a policy change is always validated end-to-end.
   */
  integrationPaths: [
    'backend/',
    'db/',
    'packages/env/',
    'pnpm-lock.yaml',
    'package.json',
    'turbo.json',
    '.nvmrc',
    'docker-compose.yml',
  ],

  /**
   * Path prefixes that, when a change touches ONLY them, allow the code checks
   * (lint, type-check, unit tests, build) to be skipped entirely.
   */
  nonCodePrefixes: ['docs/', '.github/', '.claude/', '.agents/', '.agent/'],
  nonCodeSuffixes: ['.md'],

  // ── Tier settings ───────────────────────────────────────────────────────────

  /**
   * The branch that gates the strict (release) tier.  A PR or push targeting
   * this branch always runs every job from scratch with no cache.
   */
  strictBranch: ['main'],

  /**
   * The branch that acts as the single cache producer for the fast tier.
   * Pushes here write the pnpm store and Turbo caches; PRs only restore.
   */
  cacheProducerBranch: ['develop', ''],
};
