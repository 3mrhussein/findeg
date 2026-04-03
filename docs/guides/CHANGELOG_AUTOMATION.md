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
- Architecture release notes: `docs/architecture/RELEASE_NOTES.md`
- Grouping: commits are grouped into sections by conventional commit type when available:
  - `feat` -> `Added`
  - `fix` -> `Fixed`
  - `refactor|perf|style` -> `Changed`
  - `docs|test|build|ci|chore` -> `Maintenance`
  - `revert` -> `Reverted`
  - non-conventional messages -> `Other`

## Release Notes Policy

Update `docs/architecture/RELEASE_NOTES.md` whenever a PR includes major:

- schema redesign or migration strategy changes
- domain model/value-object redesign
- auth/identity model changes (sessions, roles, permissions, principals)
- cross-feature API contract shifts

The changelog remains the full commit-derived log; release notes are a curated architecture decision timeline.

## Recommended Team Workflow

1. Keep meaningful commit messages (`feat:`, `fix:`, `refactor:`) to improve changelog quality.
2. Use conventional commit messages consistently:
   - `feat(scope): ...`
   - `fix(scope): ...`
   - `refactor(scope): ...`
   - include `!` for breaking changes (for example `refactor(auth)!: ...`)
3. Before merge, run `npm run changelog`.
4. Include `CHANGELOG.md` updates in the same PR as the feature/fix.
5. If the change is architecture-significant, also update `docs/architecture/RELEASE_NOTES.md`.
6. Enforce freshness in CI with `npm run changelog:check`.

## Notes

- The generated changelog is deterministic for a given git history.
- If history changes (rebase/squash/new commits), regenerate `CHANGELOG.md`.
