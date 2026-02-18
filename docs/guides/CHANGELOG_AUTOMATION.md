# Changelog Automation Guide

This repository uses a git-history based changelog generator.

## Commands

```bash
# Generate or update CHANGELOG.md
npm run changelog

# Preview generated changelog in terminal without writing file
npm run changelog:preview

# Validate that CHANGELOG.md is up to date (CI-friendly)
npm run changelog:check
```

## How It Works

- Source: `git log --no-merges`
- Script: `scripts/generate-changelog.js`
- Output: `CHANGELOG.md`
- Grouping: commits are grouped into sections by conventional commit type when available:
  - `feat` -> `Added`
  - `fix` -> `Fixed`
  - `refactor|perf|style` -> `Changed`
  - `docs|test|build|ci|chore` -> `Maintenance`
  - `revert` -> `Reverted`
  - non-conventional messages -> `Other`

## Recommended Team Workflow

1. Keep meaningful commit messages (`feat:`, `fix:`, `refactor:`) to improve changelog quality.
2. Before merge, run `npm run changelog`.
3. Include `CHANGELOG.md` changes in the same PR as the feature/fix.
4. Optionally enforce freshness in CI using `npm run changelog:check`.

## Notes

- The generated changelog is deterministic for a given git history.
- If history changes (rebase/squash/new commits), regenerate `CHANGELOG.md`.
