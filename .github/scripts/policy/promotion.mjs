// Promotion (develop → main): when the Promote to main button may open the release PR, and
// the PR it opens. Pure: promote.yml gathers the facts and acts on the decision (ADR-0015).
//
// The `Promote to main` workflow is a button that opens the release PR. GitHub can't grey out a
// Run workflow button, so the run itself refuses unless develop's tip has a green `CI / Gate`
// from its push run. The PR it opens carries a fixed title in the pipe format; PRs into main
// merge with a merge commit, so the title needs no commit override (see decidePrTitle).

import { CACHE_PRODUCER_BRANCH, RELEASE_GATE_BRANCH } from './config.mjs';
import { PR_TITLE_LABELS } from './pr-title.mjs';

export const PROMOTION_TITLE = `${PR_TITLE_LABELS.chore} | Promote ${CACHE_PRODUCER_BRANCH} to ${RELEASE_GATE_BRANCH}`;
const PROMOTION_LIST_LIMIT = 50;

/**
 * Whether develop may be promoted now. `headSha` is the commit the run checked and `developTip`
 * where develop points now; they must match. `ciRun` is the newest `CI` run for the push of
 * `headSha` to develop: `{ status, gate, url }`, where `gate` is the `CI / Gate` job's conclusion.
 * `aheadBy` is how many commits develop has that main does not.
 */
export function decidePromotion({ ref, headSha, developTip, ciRun, aheadBy }) {
  const sha = (headSha ?? '').slice(0, 8) || 'its tip';
  if (ref !== CACHE_PRODUCER_BRANCH) {
    return {
      ok: false,
      reason: `Run it from ${CACHE_PRODUCER_BRANCH} (Use workflow from: ${CACHE_PRODUCER_BRANCH}), not "${ref}".`,
    };
  }
  if (!ciRun) {
    return {
      ok: false,
      reason: `${CACHE_PRODUCER_BRANCH} at ${sha} has no CI run from its push yet; wait for CI to start and finish.`,
    };
  }
  if (ciRun.status !== 'completed') {
    return {
      ok: false,
      reason: `CI on ${CACHE_PRODUCER_BRANCH} at ${sha} is still ${ciRun.status}; run this again once it passes.`,
    };
  }
  if (ciRun.gate !== 'success') {
    return {
      ok: false,
      reason: `CI / Gate on ${CACHE_PRODUCER_BRANCH} at ${sha} is ${ciRun.gate || 'missing'}; fix ${CACHE_PRODUCER_BRANCH} before promoting it.`,
    };
  }
  // The PR's head is the develop branch, not a commit: if develop moved after the run started,
  // the PR would carry commits whose CI was never checked here.
  if (developTip !== headSha) {
    return {
      ok: false,
      reason: `${CACHE_PRODUCER_BRANCH} moved from ${sha} to ${(developTip ?? '').slice(0, 8) || 'an unknown commit'} after this run started; wait for its CI and run this again.`,
    };
  }
  if (!(Number(aheadBy) > 0)) {
    return {
      ok: true,
      promote: false,
      reason: `${RELEASE_GATE_BRANCH} already has every commit on ${CACHE_PRODUCER_BRANCH}; nothing to promote.`,
    };
  }
  return {
    ok: true,
    promote: true,
    reason: `CI / Gate passed on ${CACHE_PRODUCER_BRANCH} at ${sha}, which is ${aheadBy} commit(s) ahead of ${RELEASE_GATE_BRANCH}.`,
    title: PROMOTION_TITLE,
  };
}

/**
 * The promotion PR's body: how to merge it, the CI run it was opened on, and the changes it
 * ships. `commits` are `{ subject, parents }` for the commits develop has that main does not;
 * merge commits (the post-release syncs, merged branches) are left out, so the list reads as
 * the squashed feature PRs.
 */
export function buildPromotionBody({ headSha, ciRunUrl, commits = [] }) {
  const changes = commits.filter((commit) => (commit.parents ?? 1) <= 1).map((c) => c.subject);
  const shown = changes.slice(0, PROMOTION_LIST_LIMIT).map((subject) => `- ${subject}`);
  if (changes.length > shown.length) shown.push(`- …and ${changes.length - shown.length} more`);
  return [
    `Promotes \`${CACHE_PRODUCER_BRANCH}\` to \`${RELEASE_GATE_BRANCH}\` (ADR-0015).`,
    '',
    `**Merge with a merge commit, never squash**: release-please reads the commits this brings, and a squash would make the branches diverge.`,
    '',
    `Opened after \`CI / Gate\` passed on \`${CACHE_PRODUCER_BRANCH}\` at \`${(headSha ?? '').slice(0, 8)}\`${ciRunUrl ? ` ([run](${ciRunUrl}))` : ''}. This PR still runs the strict tier, E2E included.`,
    '',
    '## Changes',
    '',
    ...(shown.length > 0 ? shown : ['- (no squash commits found)']),
    '',
  ].join('\n');
}
