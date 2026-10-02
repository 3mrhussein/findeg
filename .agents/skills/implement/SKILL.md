---
name: implement
description: 'Implement a piece of work based on a spec or set of tickets.'
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Commit your work to the current branch.

Then run `node scripts/implement-pr-mode.mjs`:

- `auto`: push the branch and open a PR (repo naming rules; `Closes #<ticket>` for ticket-backed work).
- `ask`: ask “Do you want me to push this branch and open a PR?” and pause.

An explicit PR instruction in the current request overrides the mode.
