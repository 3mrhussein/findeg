---
name: implement
description: 'Implement a piece of work based on a spec or set of tickets.'
disable-model-invocation: true
---

Implement the user's ticket using the delivery workflow in root
`CONTRIBUTING.md`. Read it and `docs/agents/issue-tracker.md` first. Claim the
issue, verify its blocking implementation tickets are merged, and start a fresh
session in its own ticket worktree and branch from `origin/develop`. If this
session already owns that isolated ticket worktree, continue there. Record the
starting commit as the fixed point for review.

Use /tdd where possible, at pre-agreed seams. For instruction-only changes,
check the affected workflows and references; executable tests are needed only
where there is behavior to exercise.

Run targeted tests and typechecking during implementation, then the complete
required check command from `CONTRIBUTING.md`.

Once done, use /code-review against the recorded starting commit, with the
issue as the spec. Resolve findings and commit only the ticket's work.

Open the issue-linked PR and complete the checks, merge, and explicit issue
closure steps in `CONTRIBUTING.md`, within the user's authorization.
