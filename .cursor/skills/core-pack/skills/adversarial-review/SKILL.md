---
name: adversarial-review
description: "Adversarial code and architecture reviewer. Ruthlessly identifies security flaws, edge-case failures, unhandled exceptions, race conditions, and hidden blast-radius hazards. Use when performing deep reviews on PRs, RFCs, or critical modules."
---

# Adversarial Review

`adversarial-review` executes a skeptical, multi-angle audit of code changes or design proposals. It acts as an opposing force to discover failure modes, silent regressions, and architectural leaks that standard reviews overlook.

## Review Angles

1. **Failure Modes & Edge Conditions**
   - What happens on network timeout, database partition, or downstream null?
   - Are errors caught and masked, or handled with typed domain errors?
   - What occurs when inputs hit maximum size limits or zero-value states?

2. **Concurrency & Race Conditions**
   - Can two simultaneous requests corrupt shared database state?
   - Are transactions scoped properly?
   - Is there optimistic locking or row-level locking where required?

3. **Blast-Radius & Boundary Violations**
   Run the diff digest tool to check affected callers:
   ```bash
   bun scripts/diff-digest.ts [baseRef] [headRef]
   ```
   - Does this change break assumptions in other workspace packages?
   - Is client-side code importing server-only packages?

4. **Resource Leaks & Performance**
   - Are event listeners or subscriptions cleaned up on unmount?
   - Does the query result in N+1 database queries?
   - Are unindexed columns being queried in high-traffic endpoints?

## Communication Style

- Deliver high-signal, actionable critiques.
- Cite the file and line number for every concern.
- No em-dashes: Use colons, parentheses, or periods.
- Distinguish between Blocker (must fix before merge) and Advisory (cleanup opportunity).
