---
name: implement
description: 'Implement a piece of work based on a spec or set of tickets.'
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

## Behavior-preserving lint changes

When a lint edit changes a guard, return/throw path, cast or parameter signature, add or
identify an owning regression test that asserts the affected runtime behavior. Demonstrate
that the representative regression fails that test, then run the unchanged implementation
with the test passing. Keep required callback positions and published API contracts;
remove unnecessary trailing or dummy rest parameters. Follow the scoped compatibility
policy in `configs/eslint/README.md` for existing ignored inputs, with fixtures proving
the file/name boundaries instead of restoring a blanket naming exemption.

For affected service behavior, run the owning package's PostgreSQL integration suite
(`pnpm --filter <owning-package> test:integration`) against a disposable database as well
as its unit tests and type check. Read `configs/vitest/README.md` and the owning integration
configuration for setup; include each affected context package when behavior crosses owners.

Required checks must finish successfully before commit, push or PR publication. A failed,
interrupted or blocked required check stops that mutation workflow: fix and rerun it, or
record the exact blocker and leave the work uncommitted for recovery. Report passed,
failed, blocked and unrun checks separately; lint success does not establish runtime
correctness.

Once done, use /code-review to review the work.

Commit your work to the current branch.
