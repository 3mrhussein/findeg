# Content Migration Tracking Checklist

This document tracks the migration of legacy documentation content into the new 3-tier hierarchy.

## Source Files and Migration Status

| Source File                                                | Target Location                    | Contained Key Info                                  | Status |
| :--------------------------------------------------------- | :--------------------------------- | :-------------------------------------------------- | :----: |
| `docs/architecture/ARCHITECTURE_PLAYBOOK.md`               | Root README + Backend README       | Core architecture diagrams & layer responsibilities |  [ ]   |
| `docs/architecture/clean-architecture.md`                  | Backend README                     | Layer rules, ServiceResult pattern                  |  [ ]   |
| `docs/architecture/DOMAIN_TYPE_BLOCKS.md`                  | Backend README                     | Domain modeling standards                           |  [ ]   |
| `docs/architecture/BACKEND_MIGRATION_PATTERNS.md`          | Backend README                     | Backend migration patterns                          |  [ ]   |
| `docs/development/component-placement.md`                  | Dashboard + Storefront READMEs     | Component placement rules                           |  [ ]   |
| `docs/development/conventions.md`                          | Root README + Package READMEs      | Coding conventions, TODO patterns                   |  [ ]   |
| `docs/guides/CODING_STANDARDS.md`                          | Root README                        | General standards, commit conventions               |  [ ]   |
| `docs/guides/DEVELOPMENT.md`                               | Root README                        | Local setup, scripts, DB commands                   |  [ ]   |
| `docs/guides/MONOREPO_MIGRATION.md`                        | Root README                        | Monorepo structure & context                        |  [ ]   |
| `docs/guides/SCALING.md`                                   | Root README                        | Architecture decisions for scale                    |  [ ]   |
| `docs/guides/LOGGING.md`                                   | Backend README                     | Logger usage & standards                            |  [ ]   |
| `docs/guides/CHANGELOG_AUTOMATION.md`                      | Root README                        | Changelog automation rules                          |  [ ]   |
| `docs/guides/SHADCN_COMPONENT_ADOPTION_MAP.md`             | UI README                          | Component inventory                                 |  [ ]   |
| `docs/testing/CYPRESS_CODING_STANDARDS.md`                 | Dashboard + Storefront READMEs     | E2E test standards                                  |  [ ]   |
| `docs/testing/FRONTEND_TEST_MASTER_PLAN.md`                | Dashboard + Storefront READMEs     | Frontend testing strategy                           |  [ ]   |
| `docs/onboarding/README.md`                                | Root README                        | Onboarding milestones & quick start                 |  [ ]   |
| `docs/features/SCHOOL_LIST_PRIVATE_ACCESS_FEATURE_SPEC.md` | Backend `school` Feature README    | Upcoming feature spec                               |  [ ]   |
| `docs/features/NEXT_PHASE_PUBLIC_SHOP_FEATURES_SPEC.md`    | Root README (Roadmap)              | Upcoming roadmap items                              |  [ ]   |
| `docs/architecture/RELEASE_NOTES.md`                       | Root README (Changelog context)    | Historical release notes                            |  [ ]   |
| `ADMIN_PAGES_UPDATE_GUIDE.md`                              | Dashboard README                   | Admin page update patterns                          |  [ ]   |
| `packages/dashboard/docs/admin/NAVIGATION.md`              | Dashboard README                   | Admin sidebar/nav config                            |  [ ]   |
| `packages/dashboard/docs/admin/COMPONENT_MAP.md`           | Dashboard README                   | Component mapping for admin                         |  [ ]   |
| `packages/dashboard/docs/admin/DESIGN_PATTERNS.md`         | Dashboard README                   | Admin-specific patterns                             |  [ ]   |
| `packages/dashboard/docs/admin/product-management.md`      | Dashboard `catalog` Feature README | Product management flows                            |  [ ]   |
| `packages/dashboard/docs/admin/tag-management.md`          | Dashboard `catalog` Feature README | Tag management flows                                |  [ ]   |
| `packages/dashboard/docs/admin/category-management.md`     | Dashboard `catalog` Feature README | Category management flows                           |  [ ]   |

## Feature Status Tracking

| Feature        | Backend README | Frontend README | Status |
| :------------- | :------------- | :-------------- | :----: |
| catalog        | [ ]            | [ ]             |  [ ]   |
| cart           | [ ]            | [ ]             |  [ ]   |
| order          | [ ]            | [ ]             |  [ ]   |
| identity       | [ ]            | [ ]             |  [ ]   |
| administration | [ ]            | [ ]             |  [ ]   |
| review         | [ ]            | [ ]             |  [ ]   |
| media          | [ ]            | [ ]             |  [ ]   |
| core           | [ ]            | [ ]             |  [ ]   |
| notifications  | [ ]            | [ ]             |  [ ]   |
| school         | [ ]            | [ ]             |  [ ]   |
