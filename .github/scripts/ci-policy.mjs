// CI Policy: Pure decision functions governing branch validation, tier selection, and pipeline gating.
// No file I/O or environment manipulation occurs here. Callers pass plain inputs and act on outputs.

import {
  FAST_TIER_BRANCH_PATTERNS,
  ALLOWED_MAIN_TARGET_SOURCES,
  BRANCH_ONLY_TYPES,
  CACHE_PRODUCER_BRANCH,
  CI_WORKFLOW_DEFINITION_PATHS,
  CONVENTIONAL_COMMIT_TYPES,
  EXEMPT_BRANCH_NAMES,
  EXEMPT_BRANCH_PREFIXES,
  INTEGRATION_TEST_TRIGGER_PATHS,
  NON_CODE_PATH_PREFIXES,
  NON_CODE_PATH_SUFFIXES,
  RELEASE_GATE_BRANCH,
} from './ci-config.mjs';

const VALID_BRANCH_TYPES = [...CONVENTIONAL_COMMIT_TYPES, ...BRANCH_ONLY_TYPES];
const BRANCH_NAME_REGEXP = new RegExp(`^(${VALID_BRANCH_TYPES.join('|')})/[a-z0-9]+(-[a-z0-9]+)*$`);

// All paths that always count as code
const ALL_CI_PATHS = [...CI_WORKFLOW_DEFINITION_PATHS];

// Paths that trigger the Postgres integration suite, plus CI workflows themselves
const ALL_INTEGRATION_PATHS = [...INTEGRATION_TEST_TRIGGER_PATHS, ...ALL_CI_PATHS];

function isExemptBranch(branchName) {
  return (
    EXEMPT_BRANCH_NAMES.includes(branchName) ||
    EXEMPT_BRANCH_PREFIXES.some((prefix) => branchName.startsWith(prefix))
  );
}

function matchesAnyPattern(targetString, patterns) {
  if (!targetString || !Array.isArray(patterns)) return false;
  return patterns.some((pattern) => {
    try {
      return new RegExp(pattern).test(targetString);
    } catch {
      return targetString.includes(pattern);
    }
  });
}

function isNonCodePath(filePath) {
  if (ALL_CI_PATHS.some((prefix) => filePath.startsWith(prefix))) return false;
  return (
    NON_CODE_PATH_SUFFIXES.some((suffix) => filePath.endsWith(suffix)) ||
    NON_CODE_PATH_PREFIXES.some((prefix) => filePath.startsWith(prefix))
  );
}

function touchesAnyPath(changedPaths, targetPrefixes) {
  return changedPaths.some((path) => targetPrefixes.some((prefix) => path.startsWith(prefix)));
}

/**
 * Validates branch naming against conventional rules (<type>/<kebab-case-slug>).
 */
export function decideBranchName({ head, base }) {
  if (isExemptBranch(head)) {
    return { ok: true, reason: `"${head}" is exempt from the branch naming rule.` };
  }
  if (head.startsWith('hotfix/') && base !== undefined && base !== RELEASE_GATE_BRANCH) {
    return {
      ok: false,
      reason: `hotfix/* branches may only open PRs into ${RELEASE_GATE_BRANCH}, not "${base}".`,
    };
  }
  if (BRANCH_NAME_REGEXP.test(head)) {
    return { ok: true, reason: `"${head}" follows <type>/<kebab-case-slug>.` };
  }
  return {
    ok: false,
    reason: `"${head}" doesn't follow <type>/<kebab-case-slug> (types: ${VALID_BRANCH_TYPES.join(', ')}; e.g. feat/backend-feature-barrels).`,
  };
}

/**
 * Validates pull request target restrictions for the release gate branch.
 */
export function decideReleaseSource({ head, base }) {
  if (base === undefined) {
    return { ok: true, reason: "Skipped: the PR's base branch isn't known yet." };
  }
  if (base !== RELEASE_GATE_BRANCH) {
    return { ok: true, reason: `Only PRs into ${RELEASE_GATE_BRANCH} have restricted sources.` };
  }
  const isAllowed =
    ALLOWED_MAIN_TARGET_SOURCES.exactBranches.includes(head) ||
    ALLOWED_MAIN_TARGET_SOURCES.prefixes.some((prefix) => head.startsWith(prefix));

  if (isAllowed) {
    return { ok: true, reason: `"${head}" may open a PR into ${RELEASE_GATE_BRANCH}.` };
  }
  return {
    ok: false,
    reason: `PRs into ${RELEASE_GATE_BRANCH} must come from ${ALLOWED_MAIN_TARGET_SOURCES.exactBranches.join(', ')}, ${ALLOWED_MAIN_TARGET_SOURCES.prefixes.map((p) => p + '*').join(', ')}, not "${head}".`,
  };
}

/**
 * Guard to verify the caller workflow matches the planned tier, if expectedTier is provided.
 */
function guardTier({ event, target, tier, expectedTier }) {
  const description = `${event} to ${target} runs the ${tier} tier`;
  if (expectedTier && expectedTier !== tier) {
    return {
      ok: false,
      reason: `${description}, but this workflow expects the ${expectedTier} tier. Check its triggers.`,
    };
  }
  return { ok: true, reason: `${description}${expectedTier ? ', as expected.' : '.'}` };
}

/**
 * A human sentence saying why a run got its tier, for the plan summary.
 */
function explainTier({ event, target, manual, producerPush, tier }) {
  const subject =
    event === 'pull_request' ? `pull request into ${target}` : `${event} to ${target}`;
  if (manual) return 'manual run: all packages with caches restored unless forced';
  if (producerPush) return `${subject}: pre-production run from scratch`;
  if (target === RELEASE_GATE_BRANCH) {
    return `${subject}: release path, everything runs from scratch`;
  }
  if (tier === 'fast') return `${subject}: affected packages with caches restored`;
  return `${subject}: no fast-tier branch pattern matches, so everything runs from scratch`;
}

/**
 * Decides how CI runs for a push, PR or manual event.
 * - Strict tier (Turbo --force, shallow clone, integration and E2E required, nothing restored):
 *   everything into the release gate branch, and pushes to the producer branch. The producer's
 *   run is verified from scratch but still saves caches, so fast-tier runs restore warm ones.
 * - Fast tier (affected packages only, caches restored): PRs into branches matching the
 *   fast-tier patterns.
 * - Manual run (fast tier, every code job on all packages, no E2E): restores caches unless
 *   forceBuild (build caches, and Turbo --force) or forceInstall (pnpm store) say otherwise.
 *   Only the force options of a manual run have any effect.
 */
export function decidePlan({
  event,
  target,
  head,
  expectedTier,
  changedPaths,
  forceBuild = false,
  forceInstall = false,
}) {
  const manual = event === 'workflow_dispatch';
  const producerPush = event === 'push' && target === CACHE_PRODUCER_BRANCH;
  const eligibleForFastTier =
    manual ||
    (target !== RELEASE_GATE_BRANCH &&
      !producerPush &&
      (matchesAnyPattern(target, FAST_TIER_BRANCH_PATTERNS) ||
        matchesAnyPattern(head, FAST_TIER_BRANCH_PATTERNS)));

  const tier = eligibleForFastTier ? 'fast' : 'strict';
  const knownChanges = Array.isArray(changedPaths);
  const runEverything = tier === 'strict' || manual || !knownChanges;
  const forcedBuild = manual && forceBuild;
  const forcedInstall = manual && forceInstall;

  let turboFlags = '--affected';
  if (tier === 'strict' || forcedBuild) turboFlags = '--force';
  else if (manual) turboFlags = '';

  return {
    ...guardTier({ event, target, tier, expectedTier }),
    tier,
    tierReason: explainTier({ event, target, manual, producerPush, tier }),
    turboFlags,
    fetchDepth: tier === 'strict' ? 1 : 0,
    restoreDeps: eligibleForFastTier && !forcedInstall,
    restoreBuild: eligibleForFastTier && !forcedBuild,
    saveCache: target === CACHE_PRODUCER_BRANCH && (event === 'push' || manual),
    runE2e: tier === 'strict',
    runChecks: runEverything || !changedPaths.every(isNonCodePath),
    runIntegration: runEverything || touchesAnyPath(changedPaths, ALL_INTEGRATION_PATHS),
  };
}

/**
 * Evaluates all job results to decide the aggregate CI OK check verdict.
 */
export function decideVerdict({ tier, results }) {
  if (results.plan !== 'success') {
    return { ok: false, reason: `CI requires plan success (${results.plan || 'no result'}).` };
  }
  if (tier !== 'fast' && tier !== 'strict') {
    return { ok: false, reason: `CI requires a known tier (${tier || 'no tier'}).` };
  }
  if (tier === 'strict' && results.e2e !== 'success') {
    return { ok: false, reason: `Strict CI requires e2e success (${results.e2e || 'no result'}).` };
  }
  const failedJobs = Object.entries(results).filter(
    ([, result]) => result !== 'success' && result !== 'skipped',
  );
  if (failedJobs.length > 0) {
    const list = failedJobs.map(([job, result]) => `${job} (${result || 'no result'})`).join(', ');
    return { ok: false, reason: `Not every CI job passed: ${list}.` };
  }
  return {
    ok: true,
    reason: `Every CI job passed or was skipped as irrelevant${tier ? ` (${tier} tier)` : ''}.`,
  };
}
