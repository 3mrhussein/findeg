# Research: Monorepo Documentation Restructure

**Branch**: `006-docs-restructure`  
**Date**: 2026-04-19

## Research Summary

No technical unknowns required investigation. This is a documentation-only feature with well-understood tools (Markdown, Mermaid, GitHub rendering). All decisions were resolved during the clarification phase.

## Decisions

### D1: `docs/` Directory Disposition

- **Decision**: Dissolve entirely — migrate all content into package and feature READMEs
- **Rationale**: User preference for a maximally clean repo root; all content is package-specific or can be absorbed into the root README
- **Alternatives considered**: Keep for cross-cutting guides (rejected — user prefers full dissolution), archive (rejected — user prefers deletion of obsolete content)

### D2: Mermaid Diagram Authoring Strategy

- **Decision**: Hybrid — auto-generate ER diagram from Drizzle schema, hand-author all other diagrams
- **Rationale**: The ER diagram can be mechanically derived from the schema source of truth; architecture and sequence diagrams require human judgment to be useful
- **Alternatives considered**: Fully hand-authored (rejected — ER diagram should track schema automatically), fully auto-generated (rejected — architecture diagrams need human curation)

### D3: Per-Feature Database Documentation Scope

- **Decision**: Each feature README documents only the specific tables and columns it reads/writes, with diagrams showing per-action DB interaction
- **Rationale**: Full schema in every feature README would violate DRY; scoped subsets keep docs relevant and maintainable
- **Alternatives considered**: Link-only to central schema (rejected — too indirect for daily reference)

### D4: Obsolete Content Handling

- **Decision**: Delete from repo. Exception: School List Private Access Feature Spec preserved as active-in-refinement
- **Rationale**: Git history preserves everything; cluttering the repo with archived docs adds noise
- **Alternatives considered**: Archive folder (rejected by user), git-history-only note (rejected — user prefers clean deletion)

### D5: Backend Feature Module Inventory (Updated from Spec)

- **Decision**: Backend has 10 features, not 8 as originally listed in spec: `catalog`, `cart`, `order`, `identity`, `administration`, `review`, `media`, `core`, `notifications`, `school`
- **Rationale**: Codebase survey revealed `notifications` and `school` feature modules not mentioned in original spec
- **Alternatives considered**: N/A — codebase is the source of truth
