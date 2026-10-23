---
name: pr-brief
description: "Generates concise, evidence-grounded Pull Request briefs and review manifests from git diffs. Analyzes modified symbols and caller blast-radius to provide human reviewers with immediate context. Use when authoring PR descriptions or preparing change summaries."
---

# PR Brief Generator

`pr-brief` converts complex git diffs into structured, token-efficient summaries for reviewers. It combines deterministic stats from `diff-digest.ts` with evidence-based narratives of why and how code changed.

## Generation Procedure

1. **Run Diff Digest**
   Execute the diff analyzer against the target branch or staged changes:
   ```bash
   bun scripts/diff-digest.ts origin/develop HEAD
   ```

2. **Extract Symbol Evidence**
   For critical modifications, verify symbol signatures:
   ```bash
   bun scripts/extract-symbol.ts <file> <symbol> --exact
   ```

3. **Compose Structured PR Brief**
   Format the output following the standard template below.

## Standard PR Brief Format

### Summary
Concise explanation of the change and its primary motivation.

### Risk Index & Blast-Radius
- **Risk Level**: [LOW | MEDIUM | HIGH]
- **Files Changed**: X files (+A, -D lines)
- **Impacted Packages**: List of affected workspace packages.
- **Key Downstream Callers**: Direct callers identified by `diff-digest.ts`.

### Key Changes
- `[file:line]` Modified symbol description and functional impact.

### Verification Evidence
- Commands executed: `pnpm type-check`, `pnpm test <file>`.
- Automated test output confirming pass status.

### Reviewer Checklist
- [ ] Type contracts and domain errors validated.
- [ ] No unwanted console logs or debug code committed.
- [ ] Database migrations backward-compatible.
- [ ] Zero em-dashes rule maintained in code comments and documentation.
