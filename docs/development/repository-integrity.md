# Repository integrity

Before committing, run from the repository root:

```sh
git diff --cached --check
node .github/scripts/check-conflict-markers.mjs
```

The pre-commit hook runs these commands before `lint-staged`. Either failure stops the
commit. Fix the reported content, stage the fix and rerun the checks before committing,
pushing or publishing a PR. Formatting alone does not validate conflict resolution.

The marker check scans **every text blob in the Git index**, including unchanged files.
It reads staged content rather than working files, so an unstaged repair cannot hide a
staged marker. Deleted files, untracked files and unstaged changes are outside the index;
Git's binary detection excludes binary blobs. Git errors fail the check.

A marker is a whole line at column one containing seven or more identical `<`, `=`, `>`
or `|` characters, optionally followed by whitespace and a label. This includes ordinary,
diff3/zdiff3 and wider custom markers. The check rejects standalone marker lines even if
the rest of a conflict is missing. It does not parse programming languages or Markdown.

Intentional examples must use inline code (such as `<<<<<<< HEAD`) or indentation:

```text
    <<<<<<< HEAD
    example from the current branch
    =======
    example from the other branch
    >>>>>>> topic
```

Indentation is explicit example handling, not a file-wide exception. Raw marker lines
in fenced code blocks still fail. A long equals-sign heading underline at column one
also matches; use a Markdown hash heading instead. There are no exempt paths or broad
allowlists. Indented conflict-like text is deliberately outside this syntax contract.

`git diff --cached --check` separately validates newly staged whitespace errors and Git's
own conflict-marker rules. It is not a full-content whitespace audit.

CI's unconditional `Repository integrity` job invokes the same index marker check on the
checkout, even when a docs-only plan skips application checks. Its failure fails
`CI / Gate`. The marker check needs only Git and Node, no dependencies, history, database
or build cache. Full-index coverage prevents old markers surviving an unrelated change.
The caller workflow's existing event/base filters still govern whether CI starts.

Run the temporary-Git regression fixtures with:

```sh
node --test .github/scripts/check-conflict-markers.test.mjs
```

The fixtures exercise staged versus working content, pre-existing tracked markers,
intentional examples, binary/deleted/untracked files, error propagation, the exact CI
command and actual commits through the hook. Formatting is stubbed only in the hook
fixture so it can prove a rejected commit never reaches the formatter.
