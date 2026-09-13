# Repository skills

The 37 skills under `.agents/skills/` are unmodified copies from
[mattpocock/skills at `3cca18b368ae95cdbdebbff572ccafa662551015`](https://github.com/mattpocock/skills/tree/3cca18b368ae95cdbdebbff572ccafa662551015).
Their 100 files also match the original local import commit
`99d5e7cf711df425c3377df0cb9588d0b37e375f` byte for byte.
`skills-lock.json` records the source paths and original source hashes.

## Setup

The native `setup-matt-pocock-skills` configuration uses GitHub Issues, the
default triage labels, and one root `CONTEXT.md` with `docs/adr/`. Its tracker,
label, and domain templates live in `docs/agents/` and are linked by `AGENTS.md`.

Choose a workflow through [ask-matt](../../.agents/skills/ask-matt/SKILL.md).
The upstream skills define their own scope and completion criteria. Repository
build checks remain documented in [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Maintenance

The skill files are tracked in Git and excluded from repository formatting so
the upstream contents stay intact. Update from upstream as a deliberate source
update, including its provenance; keep repository configuration in the setup
documents rather than editing the installed skills.

Each worktree has the skill version at its own checked-out revision. Updating
one checkout does not update another checkout or a skill body already loaded
in an agent session. An absolute skill path selects that particular checkout.
