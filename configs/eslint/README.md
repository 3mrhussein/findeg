# Shared ESLint checks

Maintained ecosystem presets live in `standards.js`; activation is tracked in
`activation.mjs`. The following project checks have no equivalent preset:

| Rule file | Reason retained |
| --- | --- |
| naming.js | Implements FindEg's local declaration naming and TSX component exceptions. |
| library-layout.js | Enforces the recursive FindEg library vocabulary and root/types export policy. |
| no-domain-value-set-copies.js | Derives business value sets from Domain and rejects local redeclarations. |
| orders-boundary.js | Enforces Orders dependency direction and rejects relative filesystem bypasses that package exports cannot prevent. |
| declared-workspace-dependencies.js | Checks workspace manifest edges, including erased types and relative imports that Node's resolver does not validate. |
| required-package-scripts.js | Requires the repository's workspace command contracts. |
| no-suppression-comments.js | Enforces the repository's prohibition of inline lint and TypeScript suppression comments. |
| import-sources.js | Shared visitor, not a lint rule; retained for workspace dependency and Orders checks across static, dynamic, require and type imports. |
| index.js | Registers the retained project rules in a shared plugin instance. |

| Layer file | Reason retained |
| --- | --- |
| runtime.js | Selects host globals and uses built-in import restrictions for each package role. |
| boundaries.js | Composes manifest-derived dependencies and Domain derivation checks. |
| surface.js | Applies the Orders project boundary; package exports own public subpath resolution. |
| hygiene.js | Applies repository script contracts to package manifests. |
| integrity.js | Applies the project suppression policy. |

## Removed checks

`runtime-imports.js` is replaced by ESLint's `no-restricted-imports` for imports
and re-exports. `standard.test.mjs` exercises forbidden
Node, React and Next imports and the test-file exception through composed lint.
Dynamic imports, CommonJS require and erased import types use built-in
`no-restricted-syntax` selectors; the same fixture suite verifies each form.

The blanket client-profile `@findeg/db` restriction and its negative architecture
fixture were obsolete: they also rejected valid server imports and could not
establish the transitive client boundary. Next.js owns that boundary via the
`server-only` marker in app query modules (ADR-0020). Existing production builds
and emitted-client checks remain the verification seam; no bespoke client rule
is restored. Package export fixtures continue rejecting unpublished subpaths.

## #476 workaround audit

- The partners lint entry disables `no-unnecessary-type-parameters` only for the legacy output-generic mapper; preserving its caller types and broad runtime mapping requires that explicit generic.
- `partnerFailure` now takes an explicit generic with no dummy rest parameter; all mapped Domain codes still map even outside the caller's expected type.
- `VariantService` uses an empty class instead of a function widened to a constructor; its file alone permits empty classes to preserve the published constructor contract.
- The AdminProductService test supplies all audit-port methods instead of a double assertion.
- Catalog tag-service's double assertion predates #476; it bridges stored nullable tag fields to the existing catalog model and requires a separate contract migration.
- `_c` in the inventory transaction mock and `_tx` in school-list query mocks are required callback argument positions; neither carries unused type arguments.
- `as unknown` on Vitest asymmetric matchers removes their `any` at assertion boundaries; these are test expectations, not production widening casts.
- `as never` on partial database executors and rows preserves existing database mock boundaries; the mocks deliberately implement only the queries observed by each test.
- Sales' database-port cast adapts the supplied partial database test double; the production provider contract is unchanged.
- The attributed-order JSON casts describe persisted JSON at the existing database boundary; #476 did not introduce a new business value set.
- `defaultVariantId as VariantId` retains the existing database-to-Domain branded-ID boundary.
- Schema import/export aliases preserve existing public names while satisfying local naming; they do not widen types.

The `--complete` measurement appends presets after workspace overrides, so it
reports the two documented constructor/output-generic exceptions as diagnostics;
the normal workspace lint command respects those file-specific exceptions.
