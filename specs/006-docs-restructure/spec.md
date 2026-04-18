# Feature Specification: Monorepo Documentation Restructure

**Feature Branch**: `006-docs-restructure`  
**Created**: 2026-04-19  
**Status**: Draft  
**Input**: User description: "Restructure monorepo documentation into a hierarchical spec system with root README, per-package READMEs, per-feature READMEs, architecture diagrams, and database schema docs — preserving all existing content."

## Constitution Compliance _(mandatory before implementation)_

This feature MUST comply with the FindEg.com Constitution (`.specify/memory/constitution.md`). Review gates:

- **I. Clean Architecture**: Documentation hierarchy mirrors the 4-layer clean architecture (domain/application/infrastructure/presentation)
- **III. Bilingual & RTL-First**: All documentation is written in English; bilingual scope is documented but not duplicated
- **IV. Feature-Oriented Core Kernel**: Per-feature READMEs follow the feature-oriented directory structure
- **VI. DRY Principle**: No duplicated content across tiers; each level references the next for deeper detail

---

## Clarifications

### Session 2026-04-19

- Q: What happens to the `docs/` directory (dissolve into packages, keep for cross-cutting, or archive)? → A: Migrate everything into package READMEs; dissolve `docs/` entirely.
- Q: How should Mermaid diagrams be authored (hand-written, auto-generated, or hybrid)? → A: Hybrid — auto-generate the DB ER diagram from the schema; hand-author all architecture, sequence, and data flow diagrams. Each feature README must document only the tables/columns relevant to that feature, with diagrams showing how each action/use-case interacts with the database.
- Q: What happens to deprecated/outdated docs that don't fit any package (delete, archive, or git-history-only)? → A: Delete them entirely. Exception: the School List Private Access Feature Spec (`SCHOOL_LIST_PRIVATE_ACCESS_FEATURE_SPEC.md`) is an essential upcoming feature still in refinement and MUST be preserved in the new hierarchy.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 — New Developer Onboarding (Priority: P1)

A new developer joins the team and needs to understand the entire system — what FindEg is, how the monorepo is organized, what technologies are used, how to set up their environment, and where to find detailed docs for the area they'll work on.

**Why this priority**: Without a coherent root entry point, onboarding takes days instead of hours. This is the primary pain point.

**Independent Test**: A developer with no prior context can navigate from the root `README.md` to the specific feature README they need within 3 clicks/scrolls, without hitting a broken link or missing file.

**Acceptance Scenarios**:

1. **Given** a freshly cloned repo, **When** the developer opens `README.md`, **Then** they see a high-level overview of the business, the tech stack, the package map, and a table of contents linking to each package README.
2. **Given** the root README, **When** the developer clicks a link to `packages/backend/README.md`, **Then** they see an architecture overview, database schema summary, feature inventory, and links to per-feature READMEs.
3. **Given** the root README, **When** the developer looks for environment setup, **Then** they find a concise Quick Start section with prerequisites, install, and database setup — directly in the root README.

---

### User Story 2 — Package-Level Deep Dive (Priority: P1)

A developer is assigned to work on the backend (or dashboard, storefront, UI) package and needs to understand its internal architecture, coding standards, dos/don'ts, testing strategy, and the full inventory of what it contains.

**Why this priority**: Per-package READMEs are the daily reference for active development. Without them, developers make architectural mistakes.

**Independent Test**: Each package README can be read standalone and provides everything a developer needs to contribute to that package without reading other package docs.

**Acceptance Scenarios**:

1. **Given** `packages/backend/README.md`, **When** the developer reads it, **Then** they find: architecture diagram, layer responsibilities, feature inventory table, database schema overview (with link to detailed ER docs), DOs/DON'Ts, testing standards, and environment setup.
2. **Given** `packages/dashboard/README.md`, **When** the developer reads it, **Then** they find: routing structure, component architecture, admin feature inventory, navigation config, theming/dark-mode standards, and testing setup.
3. **Given** `packages/storefront/README.md`, **When** the developer reads it, **Then** they find: page architecture, Server Component strategy, i18n/RTL conventions, storefront feature inventory, and performance standards.
4. **Given** `packages/ui/README.md`, **When** the developer reads it, **Then** they find: component inventory, usage patterns, theming tokens, and contribution guidelines.

---

### User Story 3 — Feature-Level Technical Reference (Priority: P2)

A developer is implementing changes to a specific feature (e.g., catalog, cart, order) and needs low-level details: the use case flow, which database tables are involved, sequence diagrams, and data computation logic.

**Why this priority**: Feature-level docs prevent architectural drift and serve as living contracts. They're essential for maintenance but lower priority than the structural framing.

**Independent Test**: A developer working on the `catalog` feature can read `packages/backend/src/features/catalog/README.md` and understand the full domain model, service layer, repository contracts, and which DB tables are queried — without reading the root or package-level README.

**Acceptance Scenarios**:

1. **Given** `packages/backend/src/features/catalog/README.md`, **When** the developer reads it, **Then** they find: feature purpose, domain entities, service interfaces, database tables used, data flow diagrams, and edge cases.
2. **Given** any backend feature README, **When** the developer looks for database details, **Then** they see which tables the feature reads/writes, with links to the central schema reference.
3. **Given** any storefront or dashboard feature README, **When** the developer reads it, **Then** they find: what backend services it consumes, the UI component structure, and the data fetching patterns.

---

### User Story 4 — Existing Content Preservation (Priority: P1)

All information currently in the ~90+ markdown files across `docs/`, `specs/`, per-package locations, and the root README must be preserved — either migrated into the new hierarchy or explicitly archived with a redirect note.

**Why this priority**: Losing institutional knowledge would create regression in team understanding.

**Independent Test**: Every piece of actionable content in the old docs (architecture rules, conventions, database schema, feature specs, coding standards) exists somewhere in the new hierarchy.

**Acceptance Scenarios**:

1. **Given** the old `docs/guides/CODING_STANDARDS.md`, **When** the restructuring is complete, **Then** its content is either integrated into the relevant package README or preserved in a standards document within the new hierarchy.
2. **Given** the old `docs/architecture/ARCHITECTURE_PLAYBOOK.md`, **When** the restructuring is complete, **Then** its diagrams and architectural rules are present in the root README architecture section or linked to from it.
3. **Given** old feature-specific docs (e.g., `docs/features/SCHOOL_LIST_PRIVATE_ACCESS_FEATURE_SPEC.md`), **When** the restructuring is complete, **Then** the info is migrated to the appropriate feature README (obsolete docs are deleted, not archived).

---

### Edge Cases

- What happens when a feature exists in both storefront and backend? → Each package gets its own README for its slice; they cross-reference each other.
- What happens when old docs contradict current code? → The restructured doc reflects the current code truth; discrepancies are noted as "deprecated" in an archive section.
- What happens when a doc covers cross-cutting concerns (e.g., i18n, theming)? → Placed at the package level where it's most relevant, with cross-links from others.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The monorepo MUST have a single root `README.md` that includes: an executive summary for stakeholders and POs, business description, technology overview, monorepo package map, build/deployment processes (detailing `turbo.json` and Docker), engineering standards (coding and testing), environment setup, test accounts, and a documentation table of contents.
- **FR-002**: Each package (`backend`, `dashboard`, `storefront`, `ui`) MUST have its own `README.md` covering: purpose, architecture (with diagrams), internal structure, detailed integration points, code-level building instructions, detailed feature inventory, coding standards (DOs/DON'Ts), testing strategy, and environment-specific setup.
- **FR-003**: Each backend feature module (`catalog`, `cart`, `order`, `identity`, `administration`, `review`, `media`, `core`, `notifications`, `school`) MUST have a `README.md` based on deep investigation of actual code in `src/features/*/`. It MUST cover: feature purpose (business-wise), extracted domain entities, actual service contracts, specific database tables/columns accessed, data flow/sequence diagrams, and technical edge cases.
- **FR-004**: Each storefront feature module MUST have a `README.md` covering: UI components, deep-dive into backend service consumption patterns, data fetching strategy (cache/RSC), page routing, and state management.
- **FR-005**: Each dashboard feature module MUST have a `README.md` covering: admin UI components, navigation, deeply analyzed backend service consumption, and the permissions model.
- **FR-006**: The backend package README MUST include a database schema section with: table inventory, ER relationships overview, and link to the detailed schema reference.
- **FR-007**: The root README MUST contain a visual documentation map showing the hierarchy of all READMEs with clickable links.
- **FR-008**: Outdated or obsolete documentation MUST be deleted from the repo. Exception: the School List Private Access Feature Spec MUST be preserved and migrated to the appropriate feature directory as an active-in-refinement spec. All actionable, current content MUST be migrated into the new hierarchy.
- **FR-009**: All internal doc links MUST be validated — no broken links to old paths or non-existent files.
- **FR-010**: Documentation MUST use Mermaid diagrams. The DB ER diagram in the backend package README MUST be auto-generated from the Drizzle schema. All other diagrams (architecture, sequence, data flow) MUST be hand-authored. Per-feature READMEs include scoped ER subsets showing only the tables relevant to that feature.
- **FR-011**: The `docs/` directory MUST be fully dissolved — all content migrated into the relevant package README or feature README. No `docs/` directory should remain after restructuring.
- **FR-012**: Comprehensive analysis MUST be done on `turbo.json`, `package.json`, `docker-compose.yml`, and the `src/` directory to derive real technical facts, rather than relying solely on legacy docs.

### Key Entities

- **Root README**: The single entry point for the entire monorepo. Contains business overview, tech stack, package map, quick start, and documentation index.
- **Package README**: Per-package documentation covering architecture, standards, and feature inventory for `backend`, `dashboard`, `storefront`, and `ui`.
- **Feature README**: Per-feature low-level technical documentation covering domain model, services, DB tables, and data flows.
- **Schema Reference**: Central database documentation with table definitions, ER diagrams, and relationship maps.
- ~~**Archive**~~: Not used — obsolete docs are deleted per clarification Q3 (git history preserves them).

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A new developer can navigate from the root README to any feature-level README within 3 link hops or fewer.
- **SC-002**: 100% of internal documentation links resolve to existing files (zero broken links).
- **SC-003**: Every package has exactly one `README.md` at its root with all mandatory sections filled.
- **SC-004**: Every backend feature module has a `README.md` with at least: purpose, entities, services, and DB tables sections.
- **SC-005**: 100% of actionable content from the existing ~90 markdown files is accounted for — either migrated or consolidated into the new hierarchy (obsolete content deleted).
- **SC-006**: The root README can be read in under 10 minutes and provides a complete mental model of the system.
- **SC-007**: Zero content duplication across tiers — each fact exists in exactly one canonical location with references from elsewhere.

---

## Assumptions

- The monorepo consists of exactly 4 packages: `backend`, `dashboard`, `storefront`, `ui`. No new packages are planned during this restructuring.
- The `specs/` directory (speckit feature specs like `001-separate-admin-project`, `002-backend-pure-typescript`) is separate from product documentation and will NOT be restructured — it's a speckit concern.
- The `.specify/`, `.agent/`, and `.github/` directories contain tooling configs and are out of scope.
- Mermaid diagrams will be used for all architectural and sequence visualizations (supported natively by GitHub).
- The database schema reference will be generated from the existing `packages/backend/docs/database/SCHEMA.md` content, not from live introspection.
- English is the sole documentation language; bilingual documentation is out of scope.
- The `CHANGELOG.md` at root is a living file and will NOT be restructured.
- The `SCHOOL_LIST_PRIVATE_ACCESS_FEATURE_SPEC.md` is an actively-refined upcoming feature spec and must be migrated (not deleted) into the appropriate feature location.
