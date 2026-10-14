---
status: accepted
---

# Shared standards and package source conventions

We want shared coding-quality standards with additional checks for each workspace's role, plus consistent package structure and public APIs. The following decisions were agreed during the design discussion and captured in spec #434; enforcement and migration are staged and remain incomplete. Acceptance records the target, not full activation.

Shared ESLint configuration extends maintained ecosystem presets and adds project-specific standards on top. The common baseline extends JavaScript recommended checks and TypeScript `strictTypeChecked`. It preserves the preset checks rather than replacing them with a hand-picked subset. Framework presets apply to the relevant code; library structure rules apply only to the library scope described below. Overrides must be narrow and justified by a concrete conflict or equivalent enforcement, rather than used to silence violations.

Shared configuration belongs under root-level `configs/`, with directories such as `eslint/`, `env/`, `tsconfig/`, and `vitest/`. Required discovery files may remain at tool-required locations and reference the shared configuration. Configuration tooling is outside the package source naming convention. Environment validation moves into `configs/env/` while preserving independent consumer-specific entry points and validation requirements; it must not eagerly validate every consumer's environment through a single barrel.

The library structure configuration applies to source under `packages/`; it is not inherited by the UI library or applications. Allowed source filenames are `index.ts`, `types.ts`, `constants.ts`, and `helpers.ts`, with `index.tsx` and `helpers.tsx` allowed for JSX implementation. Allowed structural directories are `helpers/` and `features/`. Named feature directories are allowed within `features/`, and the convention applies recursively. Package metadata, generated files, and test filenames are exempt. Each directory containing implementation code needs a `__tests__/` directory containing tests; test directories do not recursively require test directories.

Modules publish through their index entry, and parent indexes re-export their children's public APIs. An index may contain implementation, not just re-exports; it must not be excluded from coverage merely because of its filename. A package's export map exposes only its root index entry and `types.ts`, rather than direct feature or helper subpaths.

Coding-quality and naming standards apply globally, including libraries, configuration code, and applications. Constant variables use camelCase or UPPER_SNAKE_CASE. Ordinary functions, including function-valued constants, use camelCase. Type aliases, interfaces, enums, and classes use PascalCase. React component functions and component constants may use PascalCase only in `.tsx` files; `.ts` functions remain camelCase. Component exceptions include aliases and components returned by `memo` or `forwardRef`. Ordinary values, including context variables, follow the constant-variable convention. Naming applies to local declarations rather than external contract property names; imported or destructured values can be aliased locally.

Shared Vitest configuration discovers tests in `__tests__/` directories automatically and enforces minimum coverage of 80% per implementation file for lines, statements, functions, and branches. Files named `constants.ts` and `types.ts`, including nested occurrences, are excluded from coverage; constant variables in other implementation files are not an exclusion. Coverage must include all other implementation files even when tests never import them. Coverage alone does not verify that each implementation directory has its own local tests; a validation step integrated with the shared Vitest setup must check that structural requirement. Directories containing only types, constants, or re-exports do not require their own implementation tests.

Next.js is responsible for preventing server code from entering Client Component bundles. The shared standards must not introduce a separate backend-leakage policy.

## Migration work

The Domain package supplied by PR #433 is the library baseline. Spec #399 owns adoption of Domain, retirement of Money, and the business-rule changes; standards work extends that result rather than repeating it. Temporary Domain area entries remain available during internal reorganization. Domain and Orders public entries contract to the new index/types policy only after #399's consumer migration, together with remaining consumers and architecture tests. Coverage remediation is based on measured gaps in the resulting implementation, using shared Vitest configuration.

## Relationship to existing decisions

The accepted [ADR-0020](0020-domain-single-source-and-bounded-context-packages.md) supersedes conflicting Backend topology and Orders export decisions. Existing entries remain transitional until the coordinated consumer migration; acceptance does not remove them. ADR-0018 supersedes ADR-0017 and establishes Domain as the pure, rich business domain. Its business ownership, purity, and dependency contract remain unchanged by these standards.
