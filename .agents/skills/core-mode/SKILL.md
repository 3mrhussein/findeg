---
name: core-mode
description: "Core engineering workflow and token-saving operating mode. Orchestrates deterministic scripts and playbooks (investigate, feature-rfc, bug-fix, ship-pr) with type-first and evidence-first rigor. Use when the user invokes /core-mode or requests structured, token-efficient engineering execution."
---

# Core Mode Engineering Workflow

`core-mode` is the foundational operating mode designed for high-precision, token-conserving engineering work. It enforces deterministic tool execution over speculative generation, anchors all claims to verified code evidence, and routes tasks through specialized playbooks.

## Core Directives

1. **Deterministic Automation Over LLM Guessing**
   Always invoke deterministic scripts before reading broad swaths of code:
   - Boundary & Cross-Package Scan: `bun scripts/system-xray.ts .`
   - Fast Repository Inventory: `bun scripts/repo-xray.ts .`
   - Surgical Snippet Extraction: `bun scripts/extract-symbol.ts <file> <symbol> [--exact]`
   - Diff & Blast-Radius Audit: `bun scripts/diff-digest.ts [baseRef] [headRef]`
   - Visual SPA Dossier Builder: `bun scripts/build-dossier.ts <input> [output.html]`

2. **Type-First Discipline**
   Define clear TypeScript interfaces and data contracts before modifying logic or proposing changes. Reject any ambiguous implicit types.

3. **Evidence-First Verification**
   Every statement about codebase behavior must cite the concrete file path and exact line range:
   - Example: `backend/src/orders/service.ts#L45-L62`
   Never summarize from memory or unverified assumptions.

4. **Zero Em-Dash Communication Rule**
   Do not use em-dashes anywhere in messages, documentation, or code comments. Use colons, parentheses, semicolons, or periods instead.

## Playbook Routing

Route user requests to the appropriate playbook located under `.cursor/skills/core-pack/skills/core-mode/playbooks/`:

- **Investigation & RCA**: `.cursor/skills/core-pack/skills/core-mode/playbooks/investigate.md`
  Use when diagnosing regressions, unexplained errors, performance bottlenecks, or unknown flows.
- **Feature RFC & Architecture**: `.cursor/skills/core-pack/skills/core-mode/playbooks/feature-rfc.md`
  Use when planning new features, major schema migrations, or boundary alterations.
- **Bug Fix & Regression Shield**: `.cursor/skills/core-pack/skills/core-mode/playbooks/bug-fix.md`
  Use when writing targeted bug fixes with red-green regression tests.
- **Ship PR & Review Readiness**: `.cursor/skills/core-pack/skills/core-mode/playbooks/ship-pr.md`
  Use when preparing clean, audit-ready PRs with blast-radius summaries.

## Workflow Execution Protocol

1. **Step 1: Discover & Scope**
   Run `bun scripts/repo-xray.ts .` or `bun scripts/system-xray.ts .` to establish boundaries.
2. **Step 2: Pinpoint Evidence**
   Use `bun scripts/extract-symbol.ts <target> <symbol>` to extract only necessary line ranges. Never read entire multi-thousand line files into context.
3. **Step 3: Execute Playbook**
   Follow the step-by-step phases of the matched playbook.
4. **Step 4: Audit Blast-Radius**
   Run `bun scripts/diff-digest.ts` to verify caller impact and risk index before concluding.
