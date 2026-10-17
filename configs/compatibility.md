# Shared configuration transition (#435)

`configs/` is the `@findeg/config` workspace. Its ESLint profiles and lint runner are
canonical; workspace dependencies retain the same package name. TypeScript's shared
base lives in `tsconfig/base.json`. Vitest's Node/browser defaults live in
`vitest/defaults.ts`; local configs retain discovery, aliases, setup, environment
variables, integration separation, and coverage settings.

| Entry / consumer | Owner | Status / Removal prerequisite |
| --- | --- | --- |
| `packages/config/eslint/**/*.js` re-export delegates | #445 | Removed in #445; all consumers resolve canonical `configs`. |
| `packages/config/bin/lint.mjs` CLI delegate | #445 | Removed in #445; workspace packages invoke `eslint` directly. |
| `packages/config/package.json` legacy metadata | #445 | Removed in #445; `@findeg/config` is canonical in `configs/`. |
| Root `tsconfig.base.json` delegate | #445 | Removed in #445; all workspaces extend `configs/tsconfig/base.json` directly. |
| Workspace `eslint.config.js` entries | Workspace owners / #445 audit | Required ESLint discovery entries remain; package-name imports resolve canonical profiles. |
| Workspace `vitest.config.ts` entries | Workspace owners / #445 audit | Required discovery entries remain; runner policy shared via `configs/vitest/policy.mjs`. |

`packages/config/README.md` is a documentation pointer. The old ratchet JSON and
findeg-lint wrapper were removed in #445; workspace packages invoke direct ESLint
commands, and repository-level architecture standards are enforced via
`scripts/architecture` test suites. CODEOWNERS covers both locations.

Root `configs/**` and legacy delegates are Turbo global dependencies. Shared edits
invalidate all task hashes and affect all consumers, including consumers of the
TypeScript/Vitest files through relative paths. Node modules are excluded. Workspace
discovery and lockfile importer/link paths identify the new config location.

The #416 Domain value-copy guard remains canonical in
`configs/eslint/rules/no-domain-value-set-copies.js`; its legacy rule, plugin,
profile, and CLI entries delegate to that implementation until #445. All profiles
enforce it as an error. It reads the Domain package's public export graph without
adding a workspace dependency, so `packages/domain/package.json` and
`packages/domain/src/**` are also global inputs: changing the source of truth
invalidates cached checks and selects consumers without a direct Domain dependency.
Ownership, supported duplicate detection, and test/fixture/migration exemptions
are unchanged. Architecture fixtures exercise canonical and compatibility entries.

After pulling this relocation, run the usual `pnpm install` to refresh installed
workspace links. No dependency was added. For this preinstalled worktree, validation
uses `pnpm_config_verify_deps_before_run=false` to avoid pnpm's automatic reinstall;
installed legacy links exercise the compatibility delegates.

Environment configuration (#438) is canonical in `configs/env` (workspace package
`@findeg/env`, with the same `@findeg/env` and `@findeg/env/database`/`backend`/`web`
entries). It has no compatibility delegate: the old `packages/env` location was removed and
consumers resolve the new path through workspace links, TypeScript and Vitest aliases, and
the policy files. Each entry validates only its own settings.

Remaining work: #437 activation for other workspaces and #445 measured completion, which
removes the remaining temporary delegates. No business or export migration occurs here.
