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
  if (manual) return 'manual run: touched packages with caches restored unless forced';
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
 * - Manual run (fast tier, no E2E): affected packages only and caches restored by default.
 *   forceBuild (build caches, and Turbo --force) or forceInstall (pnpm store) bypass caches;
 *   fullTests runs every code job on all packages. Only a manual run honours these options.
 */
export function decidePlan({
  event,
  target,
  head,
  expectedTier,
  changedPaths,
  forceBuild = false,
  forceInstall = false,
  fullTests = false,
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
  // A manual run tests only what the branch touched (against develop) unless asked for
  // the full suite; on the producer branch, or when the diff could not be taken, there is
  // nothing to compare with, so it runs everything.
  const fullManual = manual && (fullTests || target === CACHE_PRODUCER_BRANCH || !knownChanges);
  const runEverything = tier === 'strict' || fullManual || !knownChanges;
  const forcedBuild = manual && forceBuild;
  const forcedInstall = manual && forceInstall;

  let turboFlags = '--affected';
  if (tier === 'strict') turboFlags = '--force';
  else if (fullManual) turboFlags = forcedBuild ? '--force' : '';
  else if (forcedBuild) turboFlags = '--force --affected';

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

// ── PR titles ────────────────────────────────────────────────────────────────
// A feature PR is titled `Feature | #122 | Add dispatch button`, built from its branch
// (`feat/122-add-dispatch-button`). Squash merges land the PR title as the commit, and
// release-please reads commits as Conventional Commits, so a pipe title carries a hidden
// BEGIN_COMMIT_OVERRIDE block in the PR body (release-please's own override mechanism)
// holding the Conventional Commit it stands for.

const PR_TITLE_LABELS = {
  feat: 'Feature',
  fix: 'Fix',
  docs: 'Doc',
  style: 'Style',
  refactor: 'Refactor',
  perf: 'Perf',
  test: 'Test',
  build: 'Build',
  ci: 'CI',
  chore: 'Chore',
  revert: 'Revert',
  hotfix: 'Hotfix',
};
const COMMIT_TYPE_BY_LABEL = Object.fromEntries(
  Object.entries(PR_TITLE_LABELS).map(([type, label]) => [label, type === 'hotfix' ? 'fix' : type]),
);
const PIPE_TITLE_REGEXP = new RegExp(
  `^(${Object.values(PR_TITLE_LABELS).join('|')}) \\| (?:#\\d+ \\| )?(\\S.*)$`,
);
const CONVENTIONAL_TITLE_REGEXP = new RegExp(
  `^(${CONVENTIONAL_COMMIT_TYPES.join('|')})(\\([^)]+\\))?!?: \\S.*$`,
);
const OVERRIDE_REGEXP = /BEGIN_COMMIT_OVERRIDE\s*([\s\S]*?)\s*END_COMMIT_OVERRIDE/;

const sentenceCase = (text) => text.charAt(0).toUpperCase() + text.slice(1);

function parseBranch(head) {
  const match = /^([a-z]+)\/(.+)$/.exec(head ?? '');
  if (!match || !(match[1] in PR_TITLE_LABELS) || !BRANCH_NAME_REGEXP.test(head)) return undefined;
  const issue = /^(\d+)-(.+)$/.exec(match[2]);
  return {
    type: match[1],
    issueNumber: issue ? Number(issue[1]) : undefined,
    slug: issue ? issue[2] : match[2],
  };
}

/** The issue number a branch names (`feat/122-add-x`), if any. */
export function issueNumberFromBranch(head) {
  return parseBranch(head)?.issueNumber;
}

/**
 * The title and body a new PR gets. The text comes from the issue title when the branch names
 * an issue, else the subject of the PR's only commit, else the branch slug. A PR opened with a
 * pipe title already (from the prefilled link, or typed by hand) keeps it; only its override
 * is added.
 */
export function decidePrTitleSuggestion({
  head,
  body = '',
  issueTitle,
  commitSubject,
  currentTitle,
}) {
  const branch = parseBranch(head);
  if (!branch || isExemptBranch(head)) {
    return { ok: false, reason: `"${head}" has no <type>/<slug> to build a title from.` };
  }
  const fromCommit = commitSubject?.replace(/^[a-z]+(\([^)]*\))?!?:\s*/i, '');
  const chosen = PIPE_TITLE_REGEXP.exec(currentTitle ?? '');
  const text = chosen
    ? chosen[2].trim()
    : sentenceCase(
        [issueTitle, fromCommit, branch.slug.replaceAll('-', ' ')]
          .map((candidate) => candidate?.replace(/\s+/g, ' ').trim())
          .find(Boolean),
      );
  const label = chosen ? chosen[1] : PR_TITLE_LABELS[branch.type];
  const issue = branch.issueNumber ? ` | #${branch.issueNumber}` : '';
  const title = chosen ? currentTitle : `${label}${issue} | ${text}`;
  const commitType = COMMIT_TYPE_BY_LABEL[label];
  const override = `${commitType}: ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  const block = `BEGIN_COMMIT_OVERRIDE\n${override}\nEND_COMMIT_OVERRIDE`;
  // An override already in the body is kept when it fits the new title (it may add a scope
  // or `!`); one that does not is replaced, so the title check accepts the result.
  let newBody = `${body.trimEnd()}\n\n<!--\n${block}\n-->\n`.trimStart();
  if (decidePrTitle({ title, body }).ok) newBody = body;
  else if (OVERRIDE_REGEXP.test(body)) newBody = body.replace(OVERRIDE_REGEXP, () => block);
  return { ok: true, reason: `Built from "${head}".`, title, body: newBody };
}

/** The branch a PR from `head` goes into: hotfixes into main, everything else into develop. */
export function prBaseBranch(head) {
  return head.startsWith('hotfix/') ? RELEASE_GATE_BRANCH : CACHE_PRODUCER_BRANCH;
}

/**
 * The link that opens GitHub's new-PR form with the suggested title filled in, for the pre-push
 * hook to print. GitHub's own "Compare & pull request" button can't be prefilled.
 */
export function prOpenUrl({ repoUrl, head, title }) {
  const base = prBaseBranch(head);
  const repo = repoUrl.replace(/^git@([^:]+):/, 'https://$1/').replace(/\.git$/, '');
  return `${repo}/compare/${base}...${head}?quick_pull=1&title=${encodeURIComponent(title)}`;
}

/**
 * Validates a PR title: the pipe format (which must carry a matching commit override in the
 * body) or a plain Conventional Commit, which tooling PRs (release, sync, Dependabot) use.
 */
export function decidePrTitle({ title, body = '' }) {
  const pipe = PIPE_TITLE_REGEXP.exec(title ?? '');
  if (pipe) {
    const override = OVERRIDE_REGEXP.exec(body)?.[1].split(/\r?\n/)[0].trim();
    const expected = COMMIT_TYPE_BY_LABEL[pipe[1]];
    // The override is what release-please reads, so its subject must still say what the
    // title says (case aside): a title edited on its own would leave a stale changelog line.
    const subject = new RegExp(`^${expected}(\\([^)]+\\))?!?: (\\S.*)$`).exec(override ?? '')?.[2];
    if (subject?.toLowerCase() === pipe[2].trim().toLowerCase()) {
      return { ok: true, reason: `"${title}" is valid.` };
    }
    return {
      ok: false,
      reason: `"${title}" needs a "${expected}: ${pipe[2].trim()}" line (scope and "!" optional) between BEGIN_COMMIT_OVERRIDE and END_COMMIT_OVERRIDE in the PR body, so release-please reads the squash commit the title describes.`,
    };
  }
  if (CONVENTIONAL_TITLE_REGEXP.test(title ?? '')) {
    return { ok: true, reason: `"${title}" is a valid Conventional Commit.` };
  }
  return {
    ok: false,
    reason: `"${title}" must look like "Feature | #122 | Add dispatch button" (the issue is optional; labels: ${Object.values(PR_TITLE_LABELS).join(', ')}) or a Conventional Commit.`,
  };
}
