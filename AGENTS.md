## Agent skills

### Terminal safety

- no chained slow network calls in one shell command.
- no large JSON/verbose dumps across many issues in one run.
- one focused command at a time; keep output tight with `--limit`, `--jq`, or `--web`.
- if it hangs or floods the terminal, stop and split it up.

### Issue tracker

Issues and specs live in GitHub Issues for this repository. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default canonical labels. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository: read root `CONTEXT.md` and relevant `docs/adr/` records. See `docs/agents/domain.md`.
