# Repository skills

The skills under `.agents/skills/` and `skills-lock.json` are tracked in Git.
They were imported from commit `99d5e7cf711df425c3377df0cb9588d0b37e375f`
(mattpocock/skills), with local compatibility edits. New worktrees created from
`origin/develop` after this integration inherit these files automatically.
Skill installation is separate from the dependency installation required by
`CONTRIBUTING.md`; no per-worktree skill reinstall or symlink is needed.

## Using skills here

`AGENTS.md`, `CONTRIBUTING.md`, the configured `docs/agents/` documents, and
accepted ADRs govern repository work. Apply them when a generic skill recipe
suggests a different branch, tracker, architecture, or delivery process.
Read `CONTRIBUTING.md` before a skill starts ticket work, creates worktrees,
or opens or merges PRs, including research and prototype sessions.

The existing setup is GitHub Issues, the five canonical triage state labels,
and one domain context at the root. Package count does not change that choice.
Setup skills should preserve these decisions and existing checks, making only
the configuration changes requested by the user.

Skills that mention the Skill tool mean reading and following the named
`SKILL.md` through the current agent's available skill mechanism. Slash names
refer to the same files. User-invoked skills retain their invocation metadata;
router skills guide the user to them.

## Maintaining the import

The lockfile retains the source paths and hashes from the imported setup as
upstream provenance; it is not a checksum of the locally adapted files.
Review upstream updates against our local edits before replacing files.

Compatibility edits cover ticket implementation and orchestration, the skill
router, ticket dependency planning, research/prototype isolation, and setup
preservation, plus a nested Markdown fence repair in the triage reference.
Preserve these adaptations when updating the imported skills.
Run the checks and two-axis review required by `CONTRIBUTING.md` for updates.

To inspect inheritance in a new worktree, compare its tracked
`.agents/skills/` files and `skills-lock.json` with the merged `origin/develop`.
Existing worktrees stay at their own revisions until they integrate that branch.
