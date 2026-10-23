---
name: code-dossier
description: "Generates comprehensive, evidence-backed architectural dossiers and interactive HTML SPAs for codebases and subsystems. Use when creating architectural summaries, onboarding documents, or visual technical reports."
---

# Code Dossier Generator

`code-dossier` produces editorial-quality technical documents in the style of "Inside pstack" — a publication that treats codebases as subjects worth reading about, not just documenting. The output is a standalone interactive HTML SPA with Mermaid architecture diagrams, annotated source anatomy, filterable explorer panes, and typed principle cards.

## How to run the build

```bash
bun scripts/build-dossier.ts <dossier-data.json> [output.html] [--title "Title"]
```

Supporting research scripts (run first to gather evidence):
```bash
bun scripts/system-xray.ts .        # package boundaries and dependency edges
bun scripts/repo-xray.ts .          # line counts, language distribution
bun scripts/extract-symbol.ts <file> <Symbol>  # extract TypeScript types
```

---

## The Editorial Mindset: How to Think Before You Write

This is the most important section. Read it before touching the JSON.

### Start with a thesis, not a tour

Bad dossiers list features. Good dossiers argue a position. Before writing a single field, answer:

> **What is the one counterintuitive thing this codebase teaches you about software design?**

That answer becomes `thesisQuote`. It must:
- Challenge a received wisdom (not confirm it)
- Be specific enough to be falsifiable ("deterministic loops outperform LLM orchestrators for AFK tasks")
- Sound like something a senior engineer would say in a conference talk, not a README

Examples of weak theses: *"This library makes it easy to run agents"*
Examples of strong theses: *"For work that is truly AFK, a deterministic loop is faster and cheaper because no agent makes the orchestration decisions"*

### Choose stats that argue, not report

The stat bar has 6 slots. Fill them with metrics that reveal something surprising about the system's design:
- Not: "42 source files" (nobody cares)
- Yes: "0 LLM-driven orchestration decisions" (that's a design stance)
- Yes: "3 branch strategies" (implies the system models git workflows as first-class concepts)

### Write for a reader who has never touched the codebase

Every field should transfer understanding to someone who read no documentation. No jargon without explanation. No acronyms without expansion on first use.

---

## Section-by-Section Writing Instructions

### `orientation` — The Argument Setup

This is where you tell the reader *why the codebase exists* and what problem it refuses to solve with the usual approach. Three cards, each with a distinct job:

- **Card 1: What it is** — One clear sentence on the mechanism. Then two sentences on what the mechanism replaces or improves.
- **Card 2: The friction it solves** — Name 2-3 concrete failure modes the codebase explicitly prevents. Not abstract goals; specific bad outcomes.
- **Card 3: How to read this page** — A literal guide to the dossier's structure. This orients the reader so they know where to find what.

Each card must have a `corollary` — an italicized serif pull-quote that distills the card's lesson to a single memorizable sentence. Write it last, after the card body is done.

```json
{
  "type": "orientation",
  "kicker": "ORIENTATION",
  "title": "What This System Is and Why It Exists",
  "intro": "One sentence on the design trade-off this codebase resolves.",
  "columns": 3,
  "items": [
    {
      "tag": "01",
      "badge": "CORE THESIS",
      "title": "What It Is",
      "body": "Mechanism description. What it replaces. Why the replacement is better.",
      "corollary": "The single sentence a reader should carry away."
    },
    {
      "tag": "02",
      "badge": "PROBLEM SPACE",
      "title": "The Friction Points",
      "body": "Name 2-3 failure modes it prevents. Be specific: what breaks without it?",
      "corollary": "The failure mode restated as a design axiom."
    },
    {
      "tag": "03",
      "badge": "READER GUIDE",
      "title": "How to Read This Page",
      "body": "Literal navigation: which section teaches what. Tell the reader where to start.",
      "corollary": "The right reading order as an instruction."
    }
  ]
}
```

---

### `pipeline` — The Execution Lifecycle

Show the system's lifecycle as a horizontal flow of deterministic stages. Each stage is a moment in time where control transfers. The goal is to make the reader understand: **where does execution live at each step, and what can go wrong?**

Rules:
- Name stages with uppercase verbs or nouns (QUEUE, BOOT, EXECUTE, RECONCILE), never adjectives
- Each stage gets a short `subtitle` — one line on what the stage is responsible for
- `nodes` inside each stage are the concrete implementation artifacts (function names, classes, env vars)
- Use `relation: "indirect"` + dashed amber border for nodes that participate via side effects rather than direct calls
- Arrow count should equal `stages.length - 1`; the renderer adds arrows automatically

```json
{
  "type": "pipeline",
  "kicker": "EXECUTION LIFECYCLE",
  "title": "The N-Stage Deterministic Pipeline",
  "intro": "Control never passes through an LLM router. Each stage has one job.",
  "stages": [
    {
      "name": "STAGE NAME",
      "subtitle": "What this stage is responsible for, in one clause.",
      "nodes": [
        { "label": "functionName()", "relation": "direct", "detail": "What this does and why it matters here." },
        { "label": "ENV_VAR", "relation": "indirect", "detail": "How this influences the stage without being called directly." }
      ]
    }
  ]
}
```

---

### `anatomy` — Annotated Source Code

Pick the most important 20-40 lines of source code in the entire codebase. This should be the function or class that a new contributor must understand first. Annotate it with `[1]`–`[4]` inline markers that become pink badge callouts in the rendered page.

Rules:
- Show real source code, not pseudocode
- `[N]` markers go on the line they annotate (inline with code, not on their own line)
- Each annotation answers: "what design decision does this line encode, and why wasn't the obvious alternative chosen?"
- `filename` should be the actual file path from the repo root

```json
{
  "type": "anatomy",
  "kicker": "CODE ANATOMY",
  "title": "Inside [CoreFunction] — The Critical Path",
  "intro": "Every request flows through this 40-line function. Understanding it unlocks the whole system.",
  "filename": "src/core/function.ts",
  "lang": "TypeScript",
  "code": "export async function coreFunction(opts: Options) {\n  // [1] Validate before any side effects\n  const config = await resolve(opts);\n\n  const worker = await boot(config); // [2]\n  try {\n    return await worker.run(opts.task); // [3]\n  } finally {\n    await worker.dispose(); // [4]\n  }\n}",
  "annotations": [
    { "id": "1", "title": "Validate First", "body": "All validation happens before `boot()` so the system never partially initializes on bad config." },
    { "id": "2", "title": "Lazy Boot", "body": "The worker boots here, not in the constructor, so the function is composable and testable without side effects." },
    { "id": "3", "title": "Isolated Execution", "body": "The task runs inside the worker's boundary, which enforces resource limits the caller cannot override." },
    { "id": "4", "title": "Guaranteed Teardown", "body": "`finally` ensures disposal runs even on catastrophic failure. This is the contract: the caller never manages cleanup." }
  ]
}
```

---

### `diagram` — Architecture Visualization (Mermaid)

**Every dossier must have at least one diagram.** The diagram renders client-side via Mermaid.js and switches between light/dark themes with the theme toggle.

Choose the diagram type that best answers the most important structural question about the system:

| Question | Mermaid type |
|----------|-------------|
| How do packages depend on each other? | `flowchart TD` or `flowchart LR` |
| How does a request flow through the system? | `sequenceDiagram` |
| What states can an entity be in? | `stateDiagram-v2` |
| What are the domain entities and relations? | `erDiagram` |
| How does the class hierarchy look? | `classDiagram` |

**Diagram writing rules:**
- Keep node labels short (2-4 words max). Long labels break the layout.
- Use `subgraph` to group related nodes by package or layer boundary.
- Use `:::className` styles sparingly; prefer structural clarity over color.
- The `caption` field appears in the header bar. Describe what the diagram proves, not what it shows. Bad: "Package dependencies". Good: "Every inbound request crosses exactly two package boundaries".
- The optional `legend` array adds color swatches. Use only when color encodes meaning (e.g., external vs internal, sync vs async).

```json
{
  "type": "diagram",
  "id": "architecture",
  "kicker": "ARCHITECTURE",
  "title": "Package Topology",
  "navLabel": "Architecture",
  "intro": "One sentence on what structural property this diagram reveals.",
  "caption": "Every request crosses exactly two package boundaries before reaching a domain service.",
  "legend": [
    { "color": "#f472b6", "label": "Domain layer" },
    { "color": "#38bdf8", "label": "Infrastructure layer" },
    { "color": "#f59e0b", "label": "External dependency" }
  ],
  "source": "flowchart LR\n  subgraph Frontend\n    A[storefront] --> B[backend]\n    C[dashboard] --> B\n  end\n  subgraph Backend\n    B --> D[packages/catalog]\n    B --> E[packages/identity]\n    D --> F[(PostgreSQL)]\n    E --> F\n  end"
}
```

**More diagram examples:**

Sequence diagram for request flow:
```
sequenceDiagram
  participant C as Client
  participant G as Gateway
  participant S as Service
  participant D as Database
  C->>G: POST /orders
  G->>S: createOrder(cmd)
  S->>D: INSERT order
  D-->>S: OrderRow
  S-->>G: OrderDTO
  G-->>C: 201 Created
```

State diagram for lifecycle:
```
stateDiagram-v2
  [*] --> Queued
  Queued --> Running : worktree allocated
  Running --> Passing : tests green
  Running --> Failed : tests red
  Passing --> Merged : reconcile()
  Failed --> [*] : cleanup()
  Merged --> [*]
```

Package dependency graph:
```
flowchart TD
  A[frontend/dashboard] --> B[backend]
  C[frontend/storefront] --> B
  B --> D[packages/catalog]
  B --> E[packages/identity]
  B --> F[packages/orders]
  D --> G[packages/domain]
  E --> G
  F --> G
  G --> H[(db)]
```

---

### `explorer` — The Reference Pane

The explorer is the dossier's reference section — a searchable, filterable catalog of every important module, hook, provider, or command. Think of it as interactive API documentation with editorial context.

**What makes a good explorer item:**

- `tryIt`: Must be immediately runnable code. Not pseudocode. Not "see the README". Actual import + invocation. Annotate with inline comments that explain the non-obvious options.
- `howItWorks`: Numbered mechanical steps. Start each step with a verb. Make each step something the reader can verify by reading source. Avoid vague steps like "processes the request" — say "calls `resolve()` which walks up the directory tree looking for `package.json`".
- `quotes`: One or two sentences from the system's perspective. Write in first person as if the module is explaining itself. These should crystallize the design decision, not describe the feature.
- `designLesson`: One paragraph. Answer: "What would you do differently in your own code after seeing this?" Name the specific technique, not just the abstract principle.

```json
{
  "type": "explorer",
  "id": "modules",
  "kicker": "MODULE CATALOG",
  "title": "Core Modules and Providers",
  "intro": "Searchable reference for every primary abstraction. Each entry includes runnable usage, a mechanical how-it-works, and the design lesson it teaches.",
  "items": [
    {
      "name": "moduleName",
      "category": "Layer or Domain",
      "badge": "ROLE TAG",
      "metric": "Short descriptor",
      "summary": "One sentence: what this module is responsible for.",
      "tryIt": "import { moduleName } from '@scope/package';\n\nconst result = await moduleName({\n  // comment explaining each option\n  option: 'value',\n});\nconsole.log(result.status);",
      "howItWorks": [
        "Validates input against the zod schema before touching any I/O.",
        "Calls `internalHelper()` which allocates a resource from the pool.",
        "Passes the resource handle to the strategy function — never the raw driver.",
        "Releases the handle in a `finally` block whether or not the strategy threw."
      ],
      "quotes": [
        "I validate before I allocate. If your config is wrong, you get an error before any side effect runs.",
        "I never hand you the raw driver — only the typed handle. The driver's lifetime is my problem, not yours."
      ],
      "files": ["src/core/module.ts", "src/core/module.test.ts"],
      "designLesson": "This module demonstrates the Allocate-Use-Release pattern enforced by `finally`. The caller cannot forget cleanup because cleanup is not the caller's job. Apply this whenever a resource has a clear lifecycle: make the owner of the lifecycle also own the cleanup."
    }
  ]
}
```

---

### `principles` — The Opinionated Architecture Rules

Principles are named, categorized, falsifiable rules that the codebase enforces. They are not best practices. They are the specific choices this codebase made and why. Each must have a `corollary` — the memorable version of the rule that a reader can cite in a code review.

Group principles by architectural concern using `category` (e.g., Isolation, Trust Boundary, Concurrency, Observability). The category pills become filterable in the rendered page.

Good principles:
- Name the tradeoff, not just the choice ("Disposability over State Reuse")
- Explain what breaks if you violate the rule ("If you reuse container state between runs, the second agent inherits the first agent's corrupted working directory")
- End with a corollary that could be quoted standalone

```json
{
  "type": "principles",
  "kicker": "DESIGN PRINCIPLES",
  "title": "The Architectural Axioms",
  "intro": "Each principle names a tradeoff the codebase resolved. The corollary is the rule in its shortest form.",
  "items": [
    {
      "title": "Principle Name: Verb over Adjective",
      "category": "Isolation",
      "body": "Explain what the principle requires in concrete terms. Then explain what breaks if you violate it — be specific about the failure mode. Name the alternative you rejected and why.",
      "corollary": "The rule in one sentence. Should be quotable in a code review."
    }
  ]
}
```

---

### `table` — The Trade-off Matrix

The table is a side-by-side comparison of the system's pluggable variants, strategies, or configuration options. It answers: "given these options, which do I choose and when?"

Rules:
- First column is always the option/primitive name (rendered as `<code>`)
- Remaining columns answer specific selection questions: isolation level, cold start, use case, etc.
- Values should be concrete: `< 1.5s` not "fast"; `Container namespace` not "isolated"
- Never use ✓/✗ — use descriptive text so the table is readable without color

```json
{
  "type": "table",
  "kicker": "DECISION MATRIX",
  "title": "Provider and Strategy Comparison",
  "intro": "Which option to use depends on two questions: what isolation level do you need, and where does the work run?",
  "columns": ["Option", "Isolation Level", "Cold Start", "Host Safety", "Best For"],
  "rows": [
    ["optionA", "OS process namespace", "< 500ms", "Medium", "Local development with fast iteration loops"],
    ["optionB", "Container cgroups + namespaces", "< 1.5s", "High", "Production pipelines where host filesystem must be protected"],
    ["optionC", "Hardware microVM", "< 3s", "Maximum", "Untrusted code execution and cloud-scale parallel runs"]
  ]
}
```

---

## Complete JSON Skeleton

```json
{
  "meta": "CONTEXT · AUTHOR · LICENSE",
  "title": "Inside [System Name]",
  "thesisQuote": "The counterintuitive design truth this codebase embodies.",
  "summary": "2-3 sentences. What the system does, what it refuses to do, and why that refusal is the point. `inline code` supported.",
  "stats": [
    { "value": "N", "label": "Metric that reveals a design stance, not just a count" },
    { "value": "N", "label": "Another surprising quantitative property" },
    { "value": "N", "label": "A metric that shows what the system optimizes for" },
    { "value": "N", "label": "A metric that shows what the system avoids" },
    { "value": "N", "label": "A metric that shows the scope" },
    { "value": "MIT", "label": "License" }
  ],
  "sections": [
    { "type": "orientation", "id": "orientation", "kicker": "ORIENTATION", "navLabel": "Orientation", "title": "...", "columns": 3, "items": [...] },
    { "type": "pipeline",    "id": "pipeline",    "kicker": "LIFECYCLE",    "navLabel": "Lifecycle",   "title": "...", "stages": [...] },
    { "type": "anatomy",     "id": "anatomy",     "kicker": "CODE ANATOMY", "navLabel": "Anatomy",     "title": "...", "filename": "...", "lang": "TypeScript", "code": "...", "annotations": [...] },
    { "type": "diagram",     "id": "architecture","kicker": "ARCHITECTURE", "navLabel": "Architecture","title": "...", "caption": "...", "source": "flowchart LR\n..." },
    { "type": "explorer",    "id": "modules",     "kicker": "MODULE CATALOG","navLabel": "Modules",   "title": "...", "items": [...] },
    { "type": "principles",  "id": "principles",  "kicker": "PRINCIPLES",   "navLabel": "Principles",  "title": "...", "items": [...] },
    { "type": "table",       "id": "matrix",      "kicker": "MATRIX",       "navLabel": "Matrix",      "title": "...", "columns": [...], "rows": [...] }
  ]
}
```

---

## Communication Constraints

- Zero em-dashes: Use colons, parentheses, semicolons, or periods.
- Evidence-first: Anchor every claim in `howItWorks` to a real function name, file path, or line number.
- No vague verbs: Never write "handles", "processes", "manages". Say what specifically happens: "calls `resolve()` which walks up the directory tree", "serializes the result to JSON and writes to stdout".
- Concrete types: Include explicit TypeScript declarations in `tryIt` when the type reveals design intent.
- Mermaid correctness: Test diagram `source` strings with `node -e "require('mermaid')"` or the Mermaid live editor before committing. Invalid syntax silently fails to render.
