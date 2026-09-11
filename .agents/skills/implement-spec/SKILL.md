---
name: implement-spec
description: 'Implement a specification through dependency-ordered ticket PRs.'
disable-model-invocation: true
---

Read root `CONTRIBUTING.md` and `docs/agents/issue-tracker.md` before coordinating
the spec's tickets. The spec lives in GitHub Issues. Delivery uses one isolated
ticket branch and PR per ticket, targeting `develop`.

The tickets form a **task graph**. Its **frontier** contains unclaimed tickets
whose blockers are complete; blocking implementation tickets must be merged
into `develop` before dependent work starts.

Communicate through context pointers to the spec, tickets, research notes, and
commits. Run independent implementer subagents concurrently when useful, each
in a separate fresh session, worktree, and ticket branch.

## Steps

1. Read the spec, tickets, and blockers. Identify the frontier.
2. If exploration is needed, use a background exploration subagent. Save its
   notes outside implementation worktrees, or on a dedicated research branch,
   and pass the implementers a pointer.
3. Claim each selected ticket and assign one driving implementer session to it.
   Create its worktree from current `origin/develop` using `CONTRIBUTING.md`.
4. Each implementer follows /implement: build its ticket, run required checks,
   run Standards and Spec reviews against its starting commit, resolve findings,
   and open its own issue-linked PR into `develop`.
5. Integrate each PR only through the merge gates in `CONTRIBUTING.md`. Concurrent
   PRs must refresh against `develop` and pass fresh checks as earlier PRs merge.
   Record completion and explicitly close each merged ticket.
6. Recompute the frontier after merges. Start newly unblocked tickets from the
   merged `origin/develop` in fresh worktrees and sessions.
7. When all tickets are merged, verify the spec's acceptance criteria against
   `develop`. Record the results and close the completed spec issue explicitly.
8. Remove only this effort's clean, completed worktrees after verifying their
   work is preserved. Promotion to `main` follows its separate approval rule in
   `CONTRIBUTING.md`.
