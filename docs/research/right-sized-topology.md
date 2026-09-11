# Right-sized topology options for FindEg

Research date: 2026-09-11. Research ticket: [Research right-sized topology options for FindEg](https://github.com/3mrhussein/findeg/issues/36). Map: [Define the FindEg system rehabilitation blueprint](https://github.com/3mrhussein/findeg/issues/25).

This is evidence for the topology decision, not selection of the target architecture. It separates documented tooling capabilities, inspected repository facts, and FindEg-specific inferences. No application code was changed or deployment benchmark performed.

## Decision context

The accepted [application interface](https://github.com/3mrhussein/findeg/issues/26#issuecomment-5630124684) requires direct calls from Next.js server code to shared authorized application operations, with versioned JSON HTTP adapters for clients that need them. The accepted [persistence decision](https://github.com/3mrhussein/findeg/issues/32#issuecomment-5630237177) requires one PostgreSQL database, module-owned persistence, transaction-bound workflow coordination, durable idempotency, a database outbox and background worker, and one migration history. These are constraints, not open alternatives.

The [architecture criteria](https://github.com/3mrhussein/findeg/issues/33#issuecomment-5462335703) prioritize clarity, simplicity and testability before operational independence and speculative performance. The [local audit](https://github.com/3mrhussein/findeg/issues/30#issuecomment-5461805335) found a partial prototype, not a complete phase-one system. Its counts and test outcomes are historical audit evidence and were not rerun here.

Inference: portal identity, logical module ownership, workspace package, build artifact, deployed process and public hostname are separate choices. Three portals do not establish a requirement for three packages or three servers. Eight logical responsibility owners do not establish eight network services.

## Inspected baseline and version scope

Code inspection uses commit `99d5e7cf711df425c3377df0cb9588d0b37e375f`, isolated from the user's uncommitted work. Links below pin that snapshot.

| Evidence | Observed fact | Consequence for the decision |
| --- | --- | --- |
| [Workspace](https://github.com/3mrhussein/findeg/blob/99d5e7cf711df425c3377df0cb9588d0b37e375f/pnpm-workspace.yaml) | Seven packages, including two web applications | Present folder count is implementation evidence only |
| [Backend manifest](https://github.com/3mrhussein/findeg/blob/99d5e7cf711df425c3377df0cb9588d0b37e375f/backend/package.json) | Exports TypeScript source and wildcard feature paths; no build or start script | Backend is currently a shared library, not an independent HTTP service |
| [Storefront compiler configuration](https://github.com/3mrhussein/findeg/blob/99d5e7cf711df425c3377df0cb9588d0b37e375f/frontend/storefront/tsconfig.json) and [Back Office compiler configuration](https://github.com/3mrhussein/findeg/blob/99d5e7cf711df425c3377df0cb9588d0b37e375f/frontend/dashboard/tsconfig.json) | Aliases point into sibling package source | Public exports alone cannot enforce the intended interface |
| [Storefront Next configuration](https://github.com/3mrhussein/findeg/blob/99d5e7cf711df425c3377df0cb9588d0b37e375f/frontend/storefront/next.config.ts) | UI transpilation, backend externalization, Cache Components, no standalone output setting | Consumer compilation and deployment packaging need an explicit policy |
| [Turbo configuration](https://github.com/3mrhussein/findeg/blob/99d5e7cf711df425c3377df0cb9588d0b37e375f/turbo.json) | Build outputs cover Next artifacts; global dependencies include environment files | Adding compiled libraries requires updating the task graph and outputs |

The [root manifest](https://github.com/3mrhussein/findeg/blob/99d5e7cf711df425c3377df0cb9588d0b37e375f/package.json) declares pnpm 11.24.0 and Turbo ^2.9.12; [.nvmrc](https://github.com/3mrhussein/findeg/blob/99d5e7cf711df425c3377df0cb9588d0b37e375f/.nvmrc) declares Node 24.15.0. The [lockfile](https://github.com/3mrhussein/findeg/blob/99d5e7cf711df425c3377df0cb9588d0b37e375f/pnpm-lock.yaml) resolves Next 16.3.3 and TypeScript 5.9.3. Manifest ranges are not installed-version evidence.

Official sites are living documentation. At retrieval Next displayed 16.3.4, Node's 24.x page displayed 24.21.0, and pnpm displayed 12.x; the attempted pnpm 11.x workspace URL redirected to the current page. Only general workspace behavior is used below, not newer orchestration features. Exact patch compatibility, deployment packaging and timings still require checks against the selected pinned versions during implementation.

## Repository and package choices

pnpm supports multiple projects in one workspace and `workspace:` dependencies that resolve locally instead of silently falling back to the registry. It warns about cyclic workspace dependencies. This supports retaining a monorepo without requiring publication or independently versioned releases. [pnpm workspace documentation](https://pnpm.io/workspaces)

Turborepo distinguishes libraries compiled by their consumers, libraries with their own compilation step, and publishable libraries. Source-exported packages avoid a separate build but require every consumer to understand their source; they have no independent package build to cache. Compiled libraries add configuration and build outputs but can supply JavaScript to consumers. [Internal packages](https://turborepo.dev/docs/core-concepts/internal-packages)

Inference for FindEg: a small set of workspace packages can hold many deep modules behind narrow interfaces. Separate packages are justified when they create a useful consumer/runtime seam, isolate dependencies, or support meaningful build ownership. Folder-level modules plus enforced import rules remain a candidate. A package per layer per business module multiplies manifests and exports without evidence that this improves locality. Publishing private libraries adds a release workflow that phase one has not requested.

| Arrangement | Potential benefit | Cost or condition to evaluate |
| --- | --- | --- |
| One repository, few workspace packages | Shared change review and a common dependency graph; web and worker reuse | Requires declared interfaces and disciplined dependencies within packages |
| One repository, many module packages | More explicit package entry points and dependency declarations | More manifests, configuration and coordination; package count does not itself establish depth |
| One application package with internal modules | Minimal package machinery | Must still provide a clean worker entry and framework-independent application interface |
| Multiple repositories | Independent ownership and release control | Shared changes need distribution/version coordination; no such organizational requirement is established |

These are design inferences, not measured rankings. The first comparison should hold business behavior and authorization constant, then count the concepts and operational obligations each option introduces.

## HTTP placement and the three portals

Next Route Handlers expose HTTP endpoints usable by any client. The framework recommends Server Components obtain data directly rather than calling their own handlers, avoiding an extra network hop and unavailable build-time server. Its static export cannot provide the dynamic runtime needed for checkout. [Next backend-for-frontend guide](https://nextjs.org/docs/app/guides/backend-for-frontend)

Inference: a future mobile client can use versioned JSON adapters hosted in a Next application. Mobile does not force a standalone API deployment. Server Actions may remain web adapters, while mobile compatibility comes from the agreed explicit HTTP contracts and shared application operations.

Hono documents an independent Node server adapter and deployment entry point. It is a technically available HTTP host, not a dependency selected by this repository or required by this research. [Hono on Node.js](https://hono.dev/docs/getting-started/nodejs)

| Candidate | Fit with accepted decisions | Operational trade-off to decide |
| --- | --- | --- |
| One Next application serving all three portals and required HTTP routes | Direct application calls and one composition location; portal permissions remain explicit | Shared releases and failure exposure; least separation of web runtimes |
| Two or three Next applications sharing application code | Portal routes and presentation can evolve separately while using the same rules | More builds, process configuration and cross-application cache/session coordination |
| Next application(s) plus independent HTTP host | Shared application library can serve both hosts; server calls can remain direct | Additional runtime and adapter integration; independently rolling versions must remain schema-compatible |
| Every logical business module becomes a network service | Does not preserve the agreed in-process transaction coordination as stated | Would require reopening accepted decisions; not a drop-in topology alternative |

The comparison is an inference from the accepted interfaces and the documented hosting capabilities. A separate API host should earn its place through a concrete independent release, runtime or load requirement. Merely moving business rules into that host would defeat the accepted direct-call interface if web callers could only reach them over HTTP.

Separate hosts also do not automatically establish distinct authority. Next documents that exported Server Actions are public endpoints requiring authorization and that `server-only` can prevent accidental client imports. FindEg still needs application authorization on every invocation under every candidate. [Next data security](https://nextjs.org/docs/app/guides/data-security)

## Source, compilation and dependency enforcement

TypeScript explicitly warns against mapping sibling workspace packages with `paths`: resolution then behaves as a relative path and bypasses package `exports`. It recommends real workspace resolution. Inference: remove or restrict the inspected cross-package aliases when enforcing public entry points; exports and static import checks must work together. [TypeScript module reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths-should-not-point-to-monorepo-packages-or-node_modules-packages)

Next's `transpilePackages` compiles local or external packages for the application. [Transpilation reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages) Conversely, `serverExternalPackages` opts selected dependencies out of server bundling for native Node loading. It is not a client-access security mechanism, despite the current configuration comment describing it that way. [Externalization reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages)

Node 24 can strip erasable TypeScript syntax but does not type-check, does not honor tsconfig path mapping, and does not support TSX through that facility. It also restricts TypeScript handling under node_modules. A raw-source workspace working through a web bundler therefore does not prove a copied production worker artifact will run. [Node 24 TypeScript support](https://nodejs.org/docs/latest-v24.x/api/typescript.html)

Inference: decide source-versus-compiled delivery per actual consumer. UI source consumed solely by Next differs from server code consumed by Next, a worker, migrations and tests. Viable choices include compiling shared server libraries or bundling each executable with those sources. A deliberate TypeScript runner is another possibility, with its own runtime dependency and packaging obligations. Do not silently assume that all consumers share Next's resolver.

Browser-visible contracts must exclude database, provider and framework representations under the accepted application decision. Whether those contracts need a separate package depends on their real consumers; a dedicated package is not a prerequisite for a clean contract.

## Deployment, workers and deterministic builds

Next supports self-hosting, including container operation. Multiple instances introduce coordination for caches, Server Action encryption keys and rolling-version behavior. Public environment variables are embedded at build time; server runtime configuration can support promoting one image between environments. Inference: compare complete operating arrangements, not just the number of package folders. [Self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting)

Standalone output can copy traced dependencies into a deployable directory. Monorepos may need `outputFileTracingRoot` to include files outside the web project; static/public assets require explicit handling. This is separate from Turbopack's source-resolution root. A clean artifact startup check is necessary whichever package strategy wins. [Next output reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)

The worker already follows from the persistence decision. Inference: it may share code, repository and even a container image with the web runtime while using a separate supervised entry point; a scheduled dispatcher is another operating arrangement if its latency and recovery behavior meet requirements. This does not require a new broker or standalone HTTP service. The selected host must actually support the agreed execution arrangement.

Next `after` runs work after a response but remains subject to route/platform duration. Inference: it can be an opportunistic trigger, but by itself is not evidence of durable retry, recovery or outbox draining when no requests arrive. The accepted database outbox and worker must remain authoritative. [Next after reference](https://nextjs.org/docs/app/api-reference/functions/after)

Turborepo assumes cached tasks are deterministic and uses declared inputs to fingerprint outputs. Inference: a build reading live catalog state is not repaired by adding packages or a build cache. Keep mutable operational data out of the build contract, declare generated outputs and relevant build-time inputs, and run migrations as an explicit operational action. [Turborepo caching](https://turborepo.dev/docs/crafting-your-repository/caching)

For any candidate, budget database connections across web replicas and workers, not per package. Keep accepted Order, stock and Partner Reward writes in one workflow transaction. Sharing the database across separately released executables introduces schema-version coordination even when internal interfaces need no legacy compatibility. These are consequences of the accepted persistence model; pool sizes, rolling procedure and worker settings belong to the operational baseline.

## Handoff and remaining decisions

[Decide whether the monorepo and package topology should remain](https://github.com/3mrhussein/findeg/issues/28) can now settle:

1. How the three portals map to web applications, and which application hosts each required HTTP adapter.
2. Whether an independent HTTP executable solves a concrete phase-one requirement.
3. Which shared interfaces deserve packages, and where workflows, composition, module persistence, schema assembly and worker entry points live.
4. How each consumer receives executable server code, including its exports and compilation strategy.
5. Whether Turborepo's task graph/cache benefit justifies its configuration over a simpler workspace runner for the chosen package set.

The following existing tickets retain the remaining detail:

- [Reconcile Current Session and portal authorization with the target architecture](https://github.com/3mrhussein/findeg/issues/38): origins, cookies, trusted caller context and access freshness.
- [Define testing, static analysis, and architectural quality gates](https://github.com/3mrhussein/findeg/issues/29): import enforcement, build and artifact checks, application/HTTP contract checks and database concurrency tests.
- [Define environment and configuration ownership](https://github.com/3mrhussein/findeg/issues/41): build/runtime variables and composition configuration.
- [Define deployment, CI, security, and observability baseline](https://github.com/3mrhussein/findeg/issues/31): host, worker scheduling, recovery, connection budgets, caching, release procedure and measured load targets.
- [Sequence the rehabilitation and documentation migration](https://github.com/3mrhussein/findeg/issues/39): concrete retain/rewrite/delete sequencing after topology is selected.

No new ticket is necessary: the research sharpens questions already assigned to existing decisions. No fog patch has become a separate investigation. Provider pricing, comparative performance and production packaging have not been measured; this report establishes feasible shapes and decision constraints, not a performance winner or production-readiness claim.
