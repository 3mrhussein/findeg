// PR titles: the `Feature | #122 | Add x` format, the commit override behind it, and what a
// title may never hold. Pure: PR conventions and the pre-push hook call it (ADR-0002).
//
// A feature PR is titled `Feature | #122 | Add dispatch button`, built from its branch
// (`feat/122-add-dispatch-button`). Squash merges land the PR title as the commit, and
// release-please reads commits as Conventional Commits, so a pipe title carries a hidden
// BEGIN_COMMIT_OVERRIDE block in the PR body (release-please's own override mechanism)
// holding the Conventional Commit it stands for.

import { BRANCH_NAME_REGEXP, isExemptBranch } from './branches.mjs';
import {
  CACHE_PRODUCER_BRANCH,
  CONVENTIONAL_COMMIT_TYPES,
  RELEASE_GATE_BRANCH,
} from './config.mjs';

export const PR_TITLE_LABELS = {
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

// GitHub skips push and pull_request runs whose commit message holds one of these. Main's merge
// commits carry the PR title, so such a title would skip the push run on main.
const SKIP_CI_REGEXP = /\[(skip ci|ci skip|no ci|skip actions|actions skip)\]|skip-checks:\s*true/i;

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
  const repo = repoUrl
    .replace(/^git@([^:]+):/, 'https://$1/') // git@github.com:owner/repo
    .replace(/^ssh:\/\/(?:[^@/]+@)?([^/:]+)(?::\d+)?\//, 'https://$1/') // ssh://git@github.com/owner/repo
    .replace(/\.git$/, '');
  return `${repo}/compare/${base}...${head}?quick_pull=1&title=${encodeURIComponent(title)}`;
}

/**
 * Validates a PR title: the pipe format (which must carry a matching commit override in the
 * body) or a plain Conventional Commit, which tooling PRs (release, sync, Dependabot) use.
 */
export function decidePrTitle({ title, body = '', base }) {
  if (SKIP_CI_REGEXP.test(title ?? '')) {
    return {
      ok: false,
      reason: `"${title}" holds a skip-CI directive, which would skip CI on the merge commit; remove it.`,
    };
  }
  const pipe = PIPE_TITLE_REGEXP.exec(title ?? '');
  // A PR into the release gate lands as a merge commit that keeps every squash commit it
  // brings, so release-please never reads its title and no override is needed.
  if (pipe && base === RELEASE_GATE_BRANCH) {
    return {
      ok: true,
      reason: `"${title}" is valid (PRs into ${RELEASE_GATE_BRANCH} merge with a merge commit).`,
    };
  }
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
