---
name: auto-review-mode
description: 'Show or set which bot (claude or off) auto-reviews newly opened PRs, via the AUTO_REVIEW repo variable.'
---

# Auto Review Mode

`AUTO_REVIEW` is a repo variable read by `.github/workflows/claude.yml`.

## Usage

Pass the user's argument straight to the script:

- **Show current mode** (no argument):
  ```bash
  node scripts/auto-review-mode.mjs
  ```
- **Set mode** (`claude` or `off`):
  ```bash
  node scripts/auto-review-mode.mjs <mode>
  ```

Report the printed result. If the user gave an argument other than `claude` or `off`, don't guess; the script rejects it. Setting needs `gh` authenticated with permission to write repo variables.

The same variable can be changed without a terminal: the **Auto review mode** workflow (Actions tab, Run workflow) or an owner comment `/auto-review claude|off` on any issue or PR. See `docs/agents/agent-identity.md`.
