# Quickstart: Documentation Restructure

**Branch**: `006-docs-restructure`

## Prerequisites

- Access to the monorepo repo
- Familiarity with GitHub Flavored Markdown and Mermaid syntax
- Read the [spec](./spec.md) and [plan](./plan.md)

## Execution Order

1. **Phase 1** — Rewrite root `README.md` with all Tier 1 sections
2. **Phase 2** — Create/rewrite the 4 package READMEs (`backend`, `dashboard`, `storefront`, `ui`)
3. **Phase 3** — Create/rewrite all 18 feature READMEs (10 backend + 2 dashboard + 6 storefront)
4. **Phase 4** — Update `packages/backend/docs/database/SCHEMA.md` with auto-generated ER diagram
5. **Phase 5** — Delete `docs/` directory, `ADMIN_PAGES_UPDATE_GUIDE.md`, and run link validation

## Validation Steps

```bash
# Check for broken internal links (relative markdown links)
grep -r '](.*\.md' README.md packages/*/README.md packages/*/src/features/*/README.md | \
  while IFS=: read file link; do
    target=$(echo "$link" | grep -oP '\]\(\K[^)]+')
    dir=$(dirname "$file")
    if [ ! -f "$dir/$target" ]; then
      echo "BROKEN: $file -> $target"
    fi
  done

# Verify docs/ directory is deleted
[ -d docs ] && echo "ERROR: docs/ still exists" || echo "OK: docs/ dissolved"

# Count expected READMEs
expected=24
actual=$(find . -name "README.md" -not -path "*/node_modules/*" -not -path "*/.next/*" | wc -l)
echo "README count: $actual (expected: $expected)"
```

## Key References

- [Content Migration Map](./plan.md#content-migration-map) — Which file goes where
- [Spec Clarifications](./spec.md#clarifications) — Key decisions made
