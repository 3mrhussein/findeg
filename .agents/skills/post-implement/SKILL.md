---
name: post-implement
description: 'Configure post-implementation behavior (auto or ask before pushing and opening a PR).'
---

# Post Implement Mode

Configure whether agents automatically push and open a PR after finishing an implementation, or ask first.

## Usage

Run the configuration script with the desired mode:

- **Enable auto PR**:
  ```bash
  node scripts/implement-pr-mode.mjs auto
  ```
- **Ask before opening PR**:
  ```bash
  node scripts/implement-pr-mode.mjs ask
  ```
- **Check current setting**:
  ```bash
  node scripts/implement-pr-mode.mjs
  ```
