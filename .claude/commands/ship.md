---
description: Branch, commit, push, open PR, wait for approval, merge to main
argument-hint: [feature-name] [commit-message]
allowed-tools: Bash(git:*), Bash(gh:*)
---

## Context

- Current branch: !`git branch --show-current`
- Git status: !`git status --short`
- Recent commits on main: !`git log main --oneline -5`

## Your task

Follow these steps exactly, in order:

### 1 — Sync main
```
git checkout main
git pull origin main
```

### 2 — Create and checkout feature branch
Use the argument `$1` as the branch name. If no argument was given, derive a short slug from the staged/unstaged changes (e.g. `feature/add-dark-mode`).
```
git checkout -b <branch-name>
```

### 3 — Commit all changes
Stage and commit everything with the message `$2`. If no message was given, write a concise commit message based on the diff.
Include the co-author trailer:
```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### 4 — Push the branch
```
git push -u origin <branch-name>
```

### 5 — Open a Pull Request
Use `gh pr create` with:
- A short title (under 70 chars)
- A body summarising what changed and why (bullet points)
- No auto-merge flag — the PR must wait for manual approval

After opening the PR, print the PR URL and say:
> "הסתיים — הPR מוכן לאישור. תגיד לי כשתאשר ואמזג ל-main."

### 6 — Wait for approval
Do NOT merge yet. Stop here and wait for the user to explicitly say they approve or to type `/ship-merge` or similar confirmation.

### Merge step (only when user approves)
When the user confirms approval, run:
```
gh pr merge <pr-number> --merge --delete-branch
git checkout main
git pull origin main
```
Then confirm: "מוזג בהצלחה ל-main ✓"
