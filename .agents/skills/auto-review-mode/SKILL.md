---
name: auto-review-mode
description: 'Show or set which bot (claude, codex, or off) auto-reviews newly opened PRs, via the AUTO_REVIEW repo variable.'
---

# Auto Review Mode

`AUTO_REVIEW` is a repo variable read by `.github/workflows/claude.yml` and `.github/workflows/codex.yml`. Changing it here changes it for every workflow and for the whole repo at once, so switching the monitoring bot (e.g. when a subscription limit is hit) needs nothing else.

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

The same variable can be changed without a terminal: the **Auto review mode** workflow (Actions tab, Run workflow) or an owner comment `/auto-review claude|codex|off` on any issue or PR. See `docs/agents/agent-identity.md`.
