// Tier planning: how one CI run is carried out (fast or strict, which jobs, which caches).
// Pure: the plan job passes the event and changed paths, and wires the outputs (ADR-0015).

import {
  CACHE_PRODUCER_BRANCH,
  CI_WORKFLOW_DEFINITION_PATHS,
  FAST_TIER_BRANCH_PATTERNS,
  INTEGRATION_TEST_TRIGGER_PATHS,
  NON_CODE_PATH_PREFIXES,
  NON_CODE_PATH_SUFFIXES,
  RELEASE_GATE_BRANCH,
} from './config.mjs';

// All paths that always count as code
const ALL_CI_PATHS = [...CI_WORKFLOW_DEFINITION_PATHS];

// Paths that trigger the Postgres integration suite, plus CI workflows themselves
const ALL_INTEGRATION_PATHS = [...INTEGRATION_TEST_TRIGGER_PATHS, ...ALL_CI_PATHS];

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
 * A human sentence saying why a run got its tier, for the plan summary.
 */
function explainTier({ event, target, manual, fullTests, producerPush, mergedHead, tier }) {
  const subject =
    event === 'pull_request' ? `pull request into ${target}` : `${event} to ${target}`;
  if (event === 'workflow_dispatch' && target === RELEASE_GATE_BRANCH) {
    return `manual run on ${target}: the release path always runs everything from scratch`;
  }
  if (manual && fullTests) return 'manual run: full suite (every package and E2E)';
  if (manual) return 'manual run: touched packages with caches restored unless forced';
  if (producerPush && tier === 'fast') {
    return `${subject}: merged pull request, touched packages with caches restored`;
  }
  if (producerPush && mergedHead) {
    return `${subject}: merged ${mergedHead}, which carries hotfixes, so it runs from scratch`;
  }
  if (producerPush) return `${subject}: direct push (no merged pull request), run from scratch`;
  if (target === RELEASE_GATE_BRANCH) {
    return `${subject}: release path, everything runs from scratch`;
  }
  if (tier === 'fast') return `${subject}: affected packages with caches restored`;
  return `${subject}: no fast-tier branch pattern matches, so everything runs from scratch`;
}

/**
 * Decides how CI runs for a push, PR or manual event.
 * - Strict tier (Turbo --force, shallow clone, integration and E2E required, nothing restored):
 *   everything into the release gate branch, and producer pushes that bring a hotfix: a direct
 *   push (no merged PR) or the merge of a PR from main or hotfix/* (mergedHead).
 * - Fast tier (affected packages only, caches restored): PRs into branches matching the
 *   fast-tier patterns, and producer pushes that merge any other PR, which was already verified
 *   as that PR. Every producer push saves caches, so fast-tier runs restore warm ones.
 * - A manual run on the release gate branch is strict, whatever its checkboxes say.
 * - Manual run (fast tier, any other branch): affected packages only, no E2E, caches restored by default (on the
 *   producer branch, what its latest commit touched). forceBuild (build caches, and Turbo
 *   --force) or forceInstall (pnpm store) bypass caches; fullTests runs the full suite: every
 *   code job on all packages, plus E2E. Only a manual run honours these options.
 */
export function decidePlan({
  event,
  target,
  head,
  changedPaths,
  forceBuild = false,
  forceInstall = false,
  fullTests = false,
  mergedHead,
}) {
  // A manual run on the release gate branch is not a manual run: main is only ever verified
  // from scratch with the full suite, whatever the checkboxes say.
  const manual = event === 'workflow_dispatch' && target !== RELEASE_GATE_BRANCH;
  const producerPush = event === 'push' && target === CACHE_PRODUCER_BRANCH;
  // main and hotfix/* only reach develop carrying hotfixes, which get the full suite.
  const mergedFeature =
    producerPush &&
    Boolean(mergedHead) &&
    mergedHead !== RELEASE_GATE_BRANCH &&
    !mergedHead.startsWith('hotfix/');
  const eligibleForFastTier =
    manual ||
    mergedFeature ||
    (target !== RELEASE_GATE_BRANCH &&
      !producerPush &&
      (matchesAnyPattern(target, FAST_TIER_BRANCH_PATTERNS) ||
        matchesAnyPattern(head, FAST_TIER_BRANCH_PATTERNS)));

  const tier = eligibleForFastTier ? 'fast' : 'strict';
  const knownChanges = Array.isArray(changedPaths);
  // A manual run tests only what the branch touched unless asked for the full suite; when
  // the diff could not be taken there is nothing to compare with, so it runs everything.
  const fullManual = manual && (fullTests || !knownChanges);
  const runEverything = tier === 'strict' || fullManual || !knownChanges;
  const forcedBuild = manual && forceBuild;
  const forcedInstall = manual && forceInstall;

  let turboFlags = '--affected';
  if (tier === 'strict') turboFlags = '--force';
  else if (fullManual) turboFlags = forcedBuild ? '--force' : '';
  else if (forcedBuild) turboFlags = '--force --affected';

  return {
    ok: true,
    reason: `${event} to ${target} runs the ${tier} tier.`,
    tier,
    tierReason: explainTier({
      event,
      target,
      manual,
      fullTests,
      producerPush,
      mergedHead,
      tier,
    }),
    turboFlags,
    fetchDepth: tier === 'strict' ? 1 : 0,
    restoreDeps: eligibleForFastTier && !forcedInstall,
    restoreBuild: eligibleForFastTier && !forcedBuild,
    saveCache: target === CACHE_PRODUCER_BRANCH && (event === 'push' || manual),
    runE2e: tier === 'strict' || (manual && fullTests),
    runChecks: runEverything || !changedPaths.every(isNonCodePath),
    runIntegration: runEverything || touchesAnyPath(changedPaths, ALL_INTEGRATION_PATHS),
  };
}
