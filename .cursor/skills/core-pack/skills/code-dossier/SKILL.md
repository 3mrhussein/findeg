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
   Renders markdown or structured JSON findings into a standalone, dark/light theme SPA:
   ```bash
   bun scripts/build-dossier.ts <input-path> <output.html> --title "Subsystem Dossier"
   ```

## Standard Dossier Structure

When authoring a dossier document, organize sections in the following order:

1. **Executive Summary**
   Purpose of the subsystem, core responsibilities, and operational status.
2. **Package & Boundary Map**
   Internal dependencies and integration edges discovered by `system-xray.ts`.
3. **Data Contracts & Key Types**
   TypeScript interface definitions extracted using `extract-symbol.ts`.
4. **Event & Message Surface**
   Publishers, subscribers, and event channels.
5. **Environment & Configuration Catalog**
   Configuration keys, defaults, and validation schemas.
6. **Risk Analysis & Known Fragilities**
   High-coupling nodes, single points of failure, and migration recommendations.

## Communication Constraints

- Zero em-dashes: Use colons, parentheses, semicolons, or periods.
- Evidence-first: Anchor every claim to a file path and line number.
- Concrete types: Include explicit TypeScript declarations for key entities.
