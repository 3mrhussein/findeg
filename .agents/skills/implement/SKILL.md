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

After the work is committed, read `~/.config/findeg/implement-pr-mode`:

- `auto`: push the current branch and open a PR.
- `ask`, a missing file, or any other value: ask “Do you want me to push this branch and open a PR?” and pause for the answer.

An explicit PR instruction in the current request overrides the saved mode. When opening a PR, follow the repository's naming rules and include `Closes #<ticket>` for ticket-backed work.
