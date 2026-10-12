// Gate verdict: turns every CI job's result into the one required check, `CI / Gate`.
// Pure: the Gate job passes `toJSON(needs)` and the plan's tier (ADR-0015).

/**
 * Evaluates all job results to decide the verdict of the aggregate Gate check.
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
  // The strict tier runs every job, so a skipped one means a broken condition, not an
  // irrelevant change: it fails rather than letting unverified code through.
  if (tier === 'strict') {
    const notRun = Object.entries(results).filter(([, result]) => result !== 'success');
    if (notRun.length > 0) {
      const list = notRun.map(([job, result]) => `${job} (${result || 'no result'})`).join(', ');
      return { ok: false, reason: `Strict CI requires every job to succeed: ${list}.` };
    }
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
