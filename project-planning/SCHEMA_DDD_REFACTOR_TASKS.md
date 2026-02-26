# Schema + DDD Refactor Tasks

Owner: Platform Team  
Created: 2026-02-18  
Last Updated: 2026-02-19

## Purpose

Track execution of the catalog + identity schema redesign with strict progress evidence.

Status markers:
- `[ ]` not started
- `[~]` in progress
- `[x]` done
- `[!]` blocked

Manual cleanup policy:
- Delete `project-planning/SCHEMA_DDD_REFACTOR_TASKS.md` only in the final completion commit, after the completion checklist is fully green.

## Workstreams

| ID | Workstream | Status | Owner | Last Updated | Evidence |
| --- | --- | --- | --- | --- | --- |
| W1 | Core type/value-object redesign for catalog and identity | [~] | Platform Team | 2026-02-19 | `src/features/core/domain/value-objects/{Identity.ts,Pricing.ts,Media.ts}`, session payload and domain entity additive updates |
| W2 | Catalog schema redesign (localized JSONB, media JSONB, pricing + discount rules, computed strike) | [~] | Platform Team | 2026-02-19 | `schema/{products,categories,brands}.ts`, `Drizzle{Product,Category,Brand}Repository.ts`, migration `20260219_add_catalog_localized_and_pricing_jsonb.sql` |
| W3 | Identity/Auth schema redesign (linked accounts, credentials, RBAC, orgs, memberships, payment methods, guest principals) | [~] | Platform Team | 2026-02-19 | `schema/identity-access.ts`, migration `20260219_add_identity_access_model.sql`, schema index export |
| W4 | Repository/service/session/auth middleware cutover to new contracts | [~] | Platform Team | 2026-02-19 | Permission-aware guard rollout across admin/media APIs + DB-backed auth context resolution from `user_roles`/`role_permissions` in login session creation (`api/v1/_lib/middleware.ts`, `identity/infrastructure/persistence/DrizzleUserRepository.ts`, `identity/services/AuthService.ts`) |
| W5 | API/UI contract updates for pricing and localized slug routing | [~] | Platform Team | 2026-02-19 | Localized category/brand slug resolution + locale-aware mappings, expanded localized catalog search contract (`DrizzleCategoryRepository.ts`, `DrizzleBrandRepository.ts`, `DrizzleProductRepository.ts`, `storefront.ts`) |
| W6 | Seed snapshots, schema docs, diagrams, and planning docs synchronization | [~] | Platform Team | 2026-02-19 | Identity/RBAC CSV snapshots added; seeder import/truncate order updated; schema docs regenerated and seed diagram aligned (`scripts/lib/csv-seed.js`, `scripts/data/seed/tables/*.csv`, `docs/database/SCHEMA.md`) |
| W7 | Final cleanup and tracker deletion | [ ] | Platform Team | 2026-02-18 | Blocked until W1-W6 are complete |

## Interface and Contract Change Checklist

| Contract | Status | Owner | Last Updated | Evidence |
| --- | --- | --- | --- | --- |
| Product pricing: persisted `pricing` + `discountRules`, computed `resolvedPricing`, no persisted strike | [~] | Platform Team | 2026-02-19 | Persisted pricing/discount JSONB columns added; shared `resolvePricing` implemented and wired into Product entity + repository mapping |
| Localized slug/content for product/category/brand with locale-specific slug lookup | [~] | Platform Team | 2026-02-19 | Localized JSONB columns added for catalog entities; category + brand locale slug lookup and locale-resolved slug mapping enabled in repositories |
| Session payload includes actor + scoped role IDs; permission checks replace role-string guards | [~] | Platform Team | 2026-02-19 | `SessionPayload` additive auth context now populated from DB role/permission mappings in login path; route guards accept required permission codes and evaluate via authorization helpers |
| Identity model split (`users`, `auth_accounts`, `password_credentials`, RBAC, org memberships, guest principals, payment tokens) | [~] | Platform Team | 2026-02-19 | Additive identity tables + domain user extensions introduced; service cutover pending W4 |

## Documentation Synchronization Tasks

| Task | Status | Owner | Last Updated | Evidence |
| --- | --- | --- | --- | --- |
| `docs/architecture/RELEASE_NOTES.md` added and linked in changelog policy | [x] | Platform Team | 2026-02-18 | `docs/architecture/RELEASE_NOTES.md` |
| `docs/guides/CHANGELOG_AUTOMATION.md` updated with release-note requirements and commit conventions | [x] | Platform Team | 2026-02-18 | `docs/guides/CHANGELOG_AUTOMATION.md` |
| `project-planning/SYSTEM_SPECIFICATION.md` updated for actors/auth/RBAC/org/pricing/guest model | [x] | Platform Team | 2026-02-18 | `project-planning/SYSTEM_SPECIFICATION.md` |
| `project-planning/MISSING_FLOWS_MATRIX.md` updated with identity/RBAC/account-linking gaps | [x] | Platform Team | 2026-02-18 | `project-planning/MISSING_FLOWS_MATRIX.md` |
| `project-planning/USE_CASE_BACKLOG.md` updated with linked accounts, memberships, permissions, payment methods | [x] | Platform Team | 2026-02-18 | `project-planning/USE_CASE_BACKLOG.md` |
| `docs/AUTH_ARCHITECTURE.md` migrated from conceptual phase-2 notes to concrete target model + guards | [x] | Platform Team | 2026-02-18 | `docs/AUTH_ARCHITECTURE.md` |
| `docs/architecture/DOMAIN_TYPE_BLOCKS.md` updated with identity, permissions, org, payment-token, pricing/discount blocks | [x] | Platform Team | 2026-02-18 | `docs/architecture/DOMAIN_TYPE_BLOCKS.md` |
| `docs/architecture/ARCHITECTURE_PLAYBOOK.md` updated for permission guard + identity service boundary contracts | [x] | Platform Team | 2026-02-18 | `docs/architecture/ARCHITECTURE_PLAYBOOK.md` |
| `docs/database/SCHEMA.md` and `scripts/data/seed/tables/schema-diagram.mmd` synchronized for redesign milestones | [x] | Platform Team | 2026-02-18 | `docs/database/SCHEMA.md`, `docs/database/SCHEMA_REDESIGN_TARGET.md`, `scripts/data/seed/tables/schema-diagram.mmd` |
| Seed CSV set and `scripts/data/seed/tables/README.md` synchronized with final schema | [x] | Platform Team | 2026-02-19 | Identity-access tables added to CSV snapshots and README updated |

## Validation Gates

### Technical

| Gate | Status | Owner | Last Updated | Evidence |
| --- | --- | --- | --- | --- |
| `npm run type-check` | [x] | Platform Team | 2026-02-19 | Passed after W1/W2 additive rollout |
| `npm run type-check:e2e` | [x] | Platform Team | 2026-02-19 | Passed after W1/W2 additive rollout |
| Migration dry run/apply in local DB | [ ] | Platform Team | 2026-02-18 | Pending W2/W3 |
| `npm run db:seed` | [!] | Platform Team | 2026-02-19 | Blocked in current sandbox (DB connect `EPERM` to `127.0.0.1:5432`); seeder logic updated and pending validation in local dev DB |
| `npm run db:doc` | [x] | Platform Team | 2026-02-19 | Passed after schema/identity updates (`docs/database/SCHEMA.md` regenerated) |
| `npm run changelog` | [x] | Platform Team | 2026-02-18 | Passed on 2026-02-18 |
| `npm run changelog:check` | [x] | Platform Team | 2026-02-18 | Passed on 2026-02-18 |

### Functional

| Gate | Status | Owner | Last Updated | Evidence |
| --- | --- | --- | --- | --- |
| Auth login/register/guest principal flow | [~] | Platform Team | 2026-02-19 | Login path now resolves RBAC context from DB role/permission mappings; guest principal persistence/service flow still pending |
| Role/permission guard behavior | [~] | Platform Team | 2026-02-19 | Endpoint-level required permissions wired for admin/media APIs; repository/service-layer permission resolution still pending |
| Locale slug resolution | [~] | Platform Team | 2026-02-19 | Category + brand locale slug lookup implemented in repositories; UI route parity rollout pending |
| Pricing resolution with computed strike behavior | [~] | Platform Team | 2026-02-19 | Shared pricing resolver introduced (`core/domain/value-objects/Pricing.ts`), full checkout/order adoption pending |

### Documentation

| Gate | Status | Owner | Last Updated | Evidence |
| --- | --- | --- | --- | --- |
| All required docs updated | [~] | Platform Team | 2026-02-18 | In progress in this change |
| Tracker evidence links completed | [~] | Platform Team | 2026-02-19 | Updated with W1 evidence |
| Completion checklist fully green before tracker deletion | [ ] | Platform Team | 2026-02-18 | Pending final milestone |

## Completion Checklist

- [ ] all tasks `[x]`
- [ ] changelog updated
- [ ] specs updated
- [ ] schema docs regenerated
- [ ] diagrams updated
- [ ] validation commands passed
