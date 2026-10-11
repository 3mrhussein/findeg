// Branch rules: which branch names are valid, and which branches may open a PR into main.
// Pure: callers pass branch names and act on the decision (ADR-0002, ADR-0015).

import {
  ALLOWED_MAIN_TARGET_SOURCES,
  BRANCH_ONLY_TYPES,
  CONVENTIONAL_COMMIT_TYPES,
  EXEMPT_BRANCH_NAMES,
  EXEMPT_BRANCH_PREFIXES,
  RELEASE_GATE_BRANCH,
} from './config.mjs';

const VALID_BRANCH_TYPES = [...CONVENTIONAL_COMMIT_TYPES, ...BRANCH_ONLY_TYPES];
export const BRANCH_NAME_REGEXP = new RegExp(
  `^(${VALID_BRANCH_TYPES.join('|')})/[a-z0-9]+(-[a-z0-9]+)*$`,
);

/** Long-lived and tool-named branches skip the naming rule. */
export function isExemptBranch(branchName) {
  return (
    EXEMPT_BRANCH_NAMES.includes(branchName) ||
    EXEMPT_BRANCH_PREFIXES.some((prefix) => branchName.startsWith(prefix))
  );
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
