---
name: enable-auto-merge
description: 'Enable GitHub auto-merge on one PR, so it merges itself once required checks pass.'
argument-hint: "PR number (defaults to the current branch's PR)"
disable-model-invocation: true
---

# Enable Auto Merge

Auto-merge is a per-PR GitHub setting, off by default. This turns it on for one PR only.

The target is the PR number the user passed, else the PR of the current branch (`gh pr view --json number`). With no PR for the branch, ask for the number.

```bash
gh pr merge <number> --auto --merge
```

Then confirm with `gh pr view <number> --json state,autoMergeRequest` and report the result: `autoMergeRequest` set means GitHub will merge once checks pass; `state` `MERGED` means it merged right away because checks had already passed.

A failure saying auto-merge is not allowed means the repo's "Allow auto-merge" setting is off. Report it to the user; changing repo settings is theirs to do.

Turn it off again with `gh pr merge <number> --disable-auto`.
