---
name: bot-pr-review
description: 'Concise PR code review checking business logic against the resolved ticket and critical code quality.'
---

# Bot PR Review

Review a pull request focusing on **business logic correctness** against the resolved ticket and **critical code quality**. Keep feedback concise and actionable.

## Process

1. **Identify the base and diff**:
   - Compare `HEAD` against the PR base branch (e.g. `origin/<base>`).

2. **Fetch the resolved ticket(s)**:
   - Identify closing issue references using `gh pr view <pr_number> --json closingIssuesReferences` or mentioned in PR title/description.
   - Fetch the issue requirements and acceptance criteria using `gh issue view <issue_number>`. If no issue is linked, note "No linked issue found" and evaluate general logic and quality.

3. **Evaluate Two Core Dimensions**:
   - **Business Logic & Requirements**:
     - Does the implementation faithfully satisfy the ticket's goals and acceptance criteria?
     - Are any requested behaviors missing or incorrectly handled?
   - **Code Quality & Safety**:
     - Check for logic bugs, race conditions, and unhandled edge cases.
     - Check for breaking database migrations or contract changes.
     - Check compliance with repository architecture rules (`CONTEXT.md`, `docs/adr/`).

4. **Output Standards**:
   - **Concise & Direct**: Do not lecture on theoretical refactoring smells (Primitive Obsession, Feature Envy, naming opinions).
   - **No Repetition**: Do not praise passing checks or re-summarize issues that were already resolved in earlier commits.
   - **Verdict**:
     - If clean: Output a 2-line approval verdict:
       ```markdown
       ### 🤖 Review: ✅ Approved

       Requirements from Issue #<N> are satisfied. No bugs or breaking changes found.
       ```
     - If issues exist: Output only a short bulleted list of actionable findings with exact file and line numbers.
