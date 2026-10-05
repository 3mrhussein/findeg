// CI policy: pure decisions about branches, CI tiers and the CI OK gate.
// No I/O here: callers (the pre-push hook directly, the PR conventions and CI
// workflows via cli.mjs) pass plain values in and act on the decisions that
// come out.

// Conventional Commits types, matching commitlint.config.js and the PR title check.
const COMMIT_TYPES = [
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

// `hotfix` is a branch type only: hotfix commits and PR titles still use `fix:`.
const BRANCH_TYPES = [...COMMIT_TYPES, 'hotfix'];

const BRANCH_PATTERN = new RegExp(`^(${BRANCH_TYPES.join('|')})/[a-z0-9]+(-[a-z0-9]+)*$`);

// Long-lived branches, and branches named by tooling rather than by a person
// (release-please, Dependabot, Claude Code worktrees).
const EXEMPT_BRANCHES = ['main', 'develop'];
const EXEMPT_PREFIXES = ['release-please--', 'dependabot/', 'worktree-'];

function isExempt(branch) {
  return (
    EXEMPT_BRANCHES.includes(branch) || EXEMPT_PREFIXES.some((prefix) => branch.startsWith(prefix))
  );
}

// `base` is the PR's target branch. It is undefined when it isn't known yet:
// the pre-push hook runs before any PR exists. Then the hotfix-into-main rule
// can't be judged, so it is left to the CI `Branch policy` check, which always
// knows the base and re-runs when the base is edited.
export function decideBranchName({ head, base }) {
  if (isExempt(head)) {
    return { ok: true, reason: `"${head}" is exempt from the branch naming rule.` };
  }
  if (head.startsWith('hotfix/') && base !== undefined && base !== 'main') {
    return { ok: false, reason: `hotfix/* branches may only open PRs into main, not "${base}".` };
  }
  if (BRANCH_PATTERN.test(head)) {
    return { ok: true, reason: `"${head}" follows <type>/<kebab-case-slug>.` };
  }
  return {
    ok: false,
    reason: `"${head}" doesn't follow <type>/<kebab-case-slug> (types: ${BRANCH_TYPES.join(', ')}; e.g. feat/backend-feature-barrels).`,
  };
}

// Only releases (develop), urgent production fixes (hotfix/*) and release-please's
// Release PR may target main; everything else goes through develop first.
// With no base (the pre-push hook) there's no PR to judge yet.
export function decideReleaseSource({ head, base }) {
  if (base === undefined) {
    return { ok: true, reason: "Skipped: the PR's base branch isn't known yet." };
  }
  if (base !== 'main') {
    return { ok: true, reason: 'Only PRs into main have restricted sources.' };
  }
  const allowed =
    head === 'develop' || head.startsWith('hotfix/') || head.startsWith('release-please--');
  if (allowed) {
    return { ok: true, reason: `"${head}" may open a PR into main.` };
  }
  return {
    ok: false,
    reason: `PRs into main must come from develop, hotfix/* or release-please--*, not "${head}".`,
  };
}

// The CI workflows' own files: the CI and CI · Release callers, the CI jobs
// they share, and its actions. They always count as code, even under .github/.
const CI_PATHS = [
  '.github/workflows/ci.yml',
  '.github/workflows/ci-release.yml',
  '.github/workflows/ci-jobs.yml',
  '.github/actions/',
];

// Paths the Postgres-backed integration suite depends on, plus the CI
// definition itself (this policy and the CI workflow files). The root files
// define how it runs: its script (package.json), Turbo's config, the Node
// version and the local Postgres setup.
const INTEGRATION_PATHS = [
  'backend/',
  'db/',
  'packages/env/',
  'pnpm-lock.yaml',
  'package.json',
  'turbo.json',
  '.nvmrc',
  'docker-compose.yml',
  'scripts/ci-policy/',
  ...CI_PATHS,
];

// Paths no lint, type-check, unit test or build reads: prose, agent tooling and
// the other workflows. A change touching only these skips the code checks.
function isNonCode(path) {
  if (CI_PATHS.some((prefix) => path.startsWith(prefix))) return false;
  return (
    path.endsWith('.md') ||
    ['docs/', '.github/', '.claude/', '.agents/', '.agent/'].some((prefix) =>
      path.startsWith(prefix),
    )
  );
}

function touchesAny(changedPaths, prefixes) {
  return changedPaths.some((path) => prefixes.some((prefix) => path.startsWith(prefix)));
}

// The tier guard. Each CI workflow states the tier it expects (CI → fast,
// CI · Release → strict); a mismatch means its triggers are wrong, so the plan
// fails rather than run the wrong tier.
function guardTier({ event, target, tier, expectedTier }) {
  const runs = `${event} to ${target} runs the ${tier} tier`;
  if (expectedTier === undefined) {
    return { ok: false, reason: `${runs}, but this workflow doesn't state the tier it expects.` };
  }
  if (expectedTier !== tier) {
    return {
      ok: false,
      reason: `${runs}, but this workflow expects the ${expectedTier} tier. Check its triggers.`,
    };
  }
  return { ok: true, reason: `${runs}, as this workflow expects.` };
}

// Decides how CI runs for a change landing on `target`: the PR's base branch,
// or the branch that was pushed to. `changedPaths` is the list of
// repo-relative paths the change touches, or undefined when it can't be
// determined (then every job runs). `expectedTier` is the tier the calling
// workflow runs; `ok` is false (and `reason` says why) when it isn't the tier
// `target` gets, and the plan must then fail.
//
// - strict (main): everything runs, from scratch (Turbo --force, a shallow
//   clone), with no caches.
// - fast (develop and anything else): Turbo runs only affected packages, which
//   needs full history to diff against; caches are restored; a push to develop
//   is the single cache producer; the code checks (lint, type-check, unit
//   tests, build) are skipped for non-code changes, and integration tests run
//   only when what they exercise changed.
export function decidePlan({ event, target, expectedTier, changedPaths }) {
  const tier = target === 'main' ? 'strict' : 'fast';
  const known = Array.isArray(changedPaths);
  const strictOrUnknown = tier === 'strict' || !known;
  return {
    ...guardTier({ event, target, tier, expectedTier }),
    tier,
    turboFlags: tier === 'strict' ? '--force' : '--affected',
    fetchDepth: tier === 'strict' ? 1 : 0,
    useCache: tier === 'fast',
    saveCache: event === 'push' && target === 'develop',
    runChecks: strictOrUnknown || !changedPaths.every(isNonCode),
    runIntegration: strictOrUnknown || touchesAny(changedPaths, INTEGRATION_PATHS),
  };
}

// Decides whether the aggregate `CI OK` check passes, given every CI job's
// result (`success`, `failure`, `cancelled` or `skipped`, keyed by job id) and
// the tier the plan chose (undefined when the plan itself didn't finish).
//
// Skipped jobs pass: the plan skips jobs a change can't affect. Anything else
// that isn't a success fails, including results this rule doesn't recognise.
// Tier-specific rules (e.g. a skipped E2E on strict) belong here too.
export function decideVerdict({ tier, results }) {
  const bad = Object.entries(results).filter(
    ([, result]) => result !== 'success' && result !== 'skipped',
  );
  if (bad.length > 0) {
    const list = bad.map(([job, result]) => `${job} (${result || 'no result'})`).join(', ');
    return { ok: false, reason: `Not every CI job passed: ${list}.` };
  }
  return {
    ok: true,
    reason: `Every CI job passed or was skipped as irrelevant${tier ? ` (${tier} tier)` : ''}.`,
  };
}
