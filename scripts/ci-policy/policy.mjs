// CI policy: pure decisions about branches (and, later, CI tiers and gates).
// No I/O here: callers (the pre-push hook, the PR conventions workflow) pass
// plain values in and act on the { ok, reason } decisions that come out.

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
export function decideReleaseSource({ head, base }) {
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
