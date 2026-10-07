---
name: auto-review-mode
description: 'Show or set which bot (claude, codex, or off) auto-reviews newly opened PRs, via the AUTO_REVIEW repo variable.'
---

# Auto Review Mode

`AUTO_REVIEW` is a repo variable read by `.github/workflows/bots.yml` (the `claude` job).

Valid values:

- **`claude`** — Claude Code auto-reviews every new non-draft PR automatically.
- **`codex`** — The Codex GitHub app reviews on its own (no workflow run needed); `bots.yml` only manages the state labels.
- **`off`** — No auto-review; use the `review:claude` or `review:codex` labels to request a review manually.

## Usage

Pass the user's argument straight to the script:

- **Show current mode** (no argument):
  ```bash
  node scripts/auto-review-mode.mjs
  ```
- **Set mode** (`claude`, `codex`, or `off`):
  ```bash
  node scripts/auto-review-mode.mjs <mode>
  ```

Report the printed result. If the user gave an argument other than `claude`, `codex`, or `off`, don't guess; the script rejects it. Setting needs `gh` authenticated with permission to write repo variables.

The same variable can be changed without a terminal:

- The **Bots** workflow (Actions tab → Bots → Run workflow → `review-mode` action).
- An owner comment `/auto-review claude|codex|off` on any issue or PR (no argument replies with the current mode).
- Editing the variable under Settings → Secrets and variables → Actions → Variables.

See `docs/agents/agent-identity.md` for setup details and the full PR state label lifecycle.
