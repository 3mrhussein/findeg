# Shared configuration transition (#435)

`configs/` is the `@findeg/config` workspace. Its ESLint profiles and lint runner are
canonical; workspace dependencies retain the same package name. TypeScript's shared
base lives in `tsconfig/base.json`. Vitest's Node/browser defaults live in
`vitest/defaults.ts`; local configs retain discovery, aliases, setup, environment
variables, integration separation, and coverage settings.

| Entry / consumer | Owner | Removal prerequisite |
| --- | --- | --- |
| `packages/config/eslint/**/*.js` re-export delegates | #445 | All path-based consumers and installed package links resolve `configs`; no legacy file imports remain. |
| `packages/config/bin/lint.mjs` CLI delegate | #445 | Reinstall workspace links and verify every `findeg-lint` invocation resolves the canonical bin. |
| `packages/config/package.json` legacy metadata | #445 | No checkout/tool depends on the old package location; it is already excluded from workspace discovery. |
| Root `tsconfig.base.json` delegate | #445 | All workspace `extends` entries migrate to the canonical base, with relative paths verified. |
| Workspace `eslint.config.js` entries | Workspace owners / #445 audit | Required ESLint discovery entries remain; package-name imports already resolve canonical profiles after install. |
| Workspace `vitest.config.ts` entries | #437, workspace owners / #445 audit | Required discovery entries remain; migrate further shared runner policy after behavior fixtures pass. |

`packages/config/README.md` is a documentation pointer. The old ratchet JSON is
removed: both CLI entries read `configs/ratchet.json`, so there is one writable baseline.
No baseline counts were changed. CODEOWNERS covers both locations.

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

Remaining work: #436 activates presets/naming; #437 activates shared coverage and
local test placement; #438 relocates consumer-specific environment config; #445
measures full command/CI activation and removes temporary delegates. No business
or export migration occurs here.
