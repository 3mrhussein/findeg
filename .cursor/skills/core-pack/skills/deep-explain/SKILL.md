---
name: deep-explain
description: "Surgically dissects complex code paths, algorithms, and architectural invariants with line-by-line evidence. Use when explaining intricate logic, concurrency boundaries, data-flow pipelines, or legacy code."
---

# Deep Explain

`deep-explain` provides exhaustive, line-numbered technical walkthroughs of complex mechanisms, tracing data flow from ingress to persistence while citing code evidence.

## Execution Rules

1. **Extract Evidence First**
   Never explain code from memory. Use surgical extraction to pull exact symbol implementations:
   ```bash
   bun scripts/extract-symbol.ts <file-path> <symbol-name> --exact
   ```

2. **Step-by-Step Data Flow Tracing**
   Break down execution into chronological phases:
   - Ingress and Input Validation: What payload enters, and what assertions protect it?
   - State Transformation: How is internal state modified, mapped, or calculated?
   - Asynchronous and I/O Boundaries: Database queries, network requests, or event emissions.
   - Return Value or Mutation: What is returned or committed to storage?

3. **Invariants and Failure Modes**
   Explicitly document:
   - What invariants must remain true throughout execution?
   - What happens when a boundary call fails or returns null?
   - Are errors caught, wrapped, or propagated upward?

4. **Zero Em-Dash Rule**
   Strictly avoid em-dashes in explanations. Employ colons, parentheses, or periods.

## Output Format

1. **Symbol Header**: `Name`, `Kind`, `File Location [Lstart-Lend]`.
2. **Type Contract**: Concrete TypeScript interface or signature.
3. **Execution Trace**: Chronological walkthrough referencing lines `[L12]`, `[L15]`.
4. **Edge Cases**: Unhandled scenarios, boundary hazards, or concurrency notes.
