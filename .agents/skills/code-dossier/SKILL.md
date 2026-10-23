---
name: code-dossier
description: "Generates comprehensive, evidence-backed architectural dossiers and interactive HTML SPAs for codebases and subsystems. Use when creating architectural summaries, onboarding documents, or visual technical reports."
---

# Code Dossier Generator

`code-dossier` compiles deep structural inventories, boundary maps, and interactive single-page HTML applications for codebases, specific domains, or feature areas.

## Core Capabilities

1. **System Topology Scan**
   Executes deterministic boundary scanning across workspace packages:
   ```bash
   bun scripts/system-xray.ts .
   ```

2. **Repository Inventory**
   Computes language distribution, line counts, and package summaries:
   ```bash
   bun scripts/repo-xray.ts .
   ```

3. **Interactive Dossier SPA Generation**
   Renders a structured JSON dossier into the "Inside pstack" editorial SPA (Instrument Serif + Inter + JetBrains Mono, dark/light theme, scrollspy sidebar):
   ```bash
   bun scripts/build-dossier.ts <dossier-data.json> [output.html] [--title "Title"]
   ```

## Required JSON Schema

`build-dossier.ts` enforces a hard schema gate. The input **must** be a `.json` file. Flat markdown is rejected.

### Top-level fields

| Field | Type | Description |
|-------|------|-------------|
| `meta` | `string` | One-line provenance tag (e.g. "OPEN SOURCE · MIT") |
| `title` | `string` | Page / hero title |
| `thesisQuote` | `string` | Central thesis, rendered as the hero italic quote |
| `summary` | `string` | 2-3 sentence lead paragraph (inline backtick code supported) |
| `stats` | `Stat[]` | At least 4 quantitative metrics: `{ value, label }` |
| `sections` | `Section[]` | At least 5 structured visual blocks (see below) |

### Required section types

Every dossier must include all six types. The schema gate rejects the build if any are missing:

| Type | Visual Component |
|------|-----------------|
| `orientation` | 3-column card grid with optional italic corollaries |
| `pipeline` | Horizontal arrow-connected stage flow |
| `anatomy` | Side-by-side annotated code with `[1]`-`[4]` badge callouts |
| `explorer` | Split master-detail pane with search + category pills |
| `principles` | Filterable 2-column card grid with italic corollaries |
| `table` | Full-width comparison matrix |

### Explorer section requirements

Each `explorer` section must have:
- At least 4 items
- Each item must include: `tryIt`, `howItWorks[]`, `quotes[]`, `designLesson`

### Orientation / cards section shape

```json
{
  "type": "orientation",
  "kicker": "ORIENTATION",
  "title": "Section Title",
  "intro": "Optional lead sentence with `inline code` support.",
  "columns": 3,
  "items": [
    {
      "tag": "01",
      "badge": "OPTIONAL PILL",
      "title": "Card Title",
      "body": "Card body text with `inline code` support.",
      "corollary": "Optional italic serif corollary quote."
    }
  ]
}
```

### Pipeline section shape

```json
{
  "type": "pipeline",
  "kicker": "EXECUTION PIPELINE",
  "title": "Section Title",
  "stages": [
    {
      "name": "STAGE NAME",
      "subtitle": "Stage subtitle text",
      "nodes": [
        {
          "label": "identifier",
          "relation": "direct",
          "detail": "Description of this node."
        }
      ]
    }
  ]
}
```

### Anatomy section shape

```json
{
  "type": "anatomy",
  "kicker": "CODE ANATOMY",
  "title": "Section Title",
  "filename": "path/to/file.ts",
  "lang": "TypeScript",
  "code": "// [1] badge markers become pink circle labels\nconst x = 1; // [2]",
  "annotations": [
    { "id": "1", "title": "Badge Title", "body": "Explanation with `code`." }
  ]
}
```

### Explorer section shape

```json
{
  "type": "explorer",
  "kicker": "MODULE EXPLORER",
  "title": "Section Title",
  "items": [
    {
      "name": "module-name",
      "category": "Category Label",
      "badge": "OPTIONAL",
      "metric": "display metric",
      "summary": "One sentence summary.",
      "tryIt": "import { x } from 'pkg';\nawait x();",
      "howItWorks": ["Step 1", "Step 2"],
      "quotes": ["A quote about this module."],
      "files": ["src/module.ts"],
      "designLesson": "The core design insight here."
    }
  ]
}
```

### Principles section shape

```json
{
  "type": "principles",
  "kicker": "FIRST PRINCIPLES",
  "title": "Section Title",
  "items": [
    {
      "title": "Principle Name",
      "category": "Category",
      "body": "Explanation of the principle.",
      "corollary": "Italic serif takeaway."
    }
  ]
}
```

### Table section shape

```json
{
  "type": "table",
  "kicker": "COMPARISON MATRIX",
  "title": "Section Title",
  "columns": ["Col A", "Col B", "Col C"],
  "rows": [
    ["row-key", "Value B", "Value C"]
  ]
}
```

## Standard Dossier Research Workflow

Use the other scripts to gather evidence before authoring the JSON:

1. Run `bun scripts/system-xray.ts .` to map package boundaries and dependency edges.
2. Run `bun scripts/repo-xray.ts .` to compute line counts and language distribution for stats.
3. Use `bun scripts/extract-symbol.ts <file> <SymbolName>` to extract TypeScript types for anatomy callouts.
4. Author `<name>-dossier.json` following the schema above.
5. Build: `bun scripts/build-dossier.ts <name>-dossier.json dossier.html`

## Communication Constraints

- Zero em-dashes: Use colons, parentheses, semicolons, or periods.
- Evidence-first: Anchor every claim to a file path and line number.
- Concrete types: Include explicit TypeScript declarations for key entities.
