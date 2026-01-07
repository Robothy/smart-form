---
description: Create a git commit, push to remote, and create a pull request
---

# Commit, Push, and Create PR

## User Input

```text
$ARGUMENTS
```

Consider the user input before proceeding. May contain:
- Custom commit message (e.g., "Add dark mode toggle")
- Branch name (optional, will be generated if not provided)
- PR title (if different from commit message)
- PR body content

## Instructions

### 1. Check git status and determine branch
Run `git status` to see current state. Check the current branch:
- If on `main`/`master`/`develop`: A new branch must be created
- If on a feature branch: Can use existing branch

### 2. Create or verify branch
- If user provided a branch name in $ARGUMENTS, use that
- Otherwise, generate a branch name from the commit message:
  - Convert to lowercase
  - Replace spaces with hyphens
  - Remove special characters
  - Keep it under 50 characters
  - Example: "Add dark mode toggle" → `add-dark-mode-toggle`

Create and checkout the branch:
```bash
git checkout -b <branch-name>
```

Or if the branch already exists:
```bash
git checkout <branch-name>
```

### 3. Stage changes if needed
If no changes are staged, ask the user if they want to stage all changes or specific files.

### 4. Get commit context
Run these commands in parallel:
- `git diff --staged` - See staged changes
- `git log -5 --oneline` - Understand recent commit message style

### 5. Draft commit message
- If user provided a commit message in $ARGUMENTS, use that
- Otherwise, analyze changes and draft a concise commit message following the repository's style
- The commit message should:
  - Start with a verb (Add, Fix, Refactor, Remove, Update, etc.)
  - Be 1-2 sentences describing what changed and why
  - NOT include file listings or technical details
  - NOT include any attribution to "Claude", "Claude Code", "Anthropic", or similar AI tool references

### 6. Confirm before committing
- Show the drafted commit message
- Show summary of changes (files changed, insertions, deletions)
- Ask: "Commit with this message? (yes/no/edit)"
- If user says "edit", allow them to provide a new message
- If user says "no", stop and ask what they'd like to do

### 7. Create the commit
Run `git commit` with the confirmed message:
```bash
git commit -m "<commit message>"
```
Then run `git status` to verify commit succeeded.

### 8. Push to remote
- Check if branch has an upstream: `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
- If no upstream: `git push -u origin <branch>`
- If upstream exists: `git push`

### 9. Create Pull Request
**Prefer GitHub MCP tools if available.** Check for MCP GitHub tools and use them first.

If MCP tools are not available, fall back to `gh` CLI:
- Check if `gh` CLI is available: `gh --version`
- Determine base branch (usually `main` or `master`)
- Draft PR title and body:
  - Title: Concise description (can use commit message or user-provided title)
  - Body: Include summary of changes with a test plan checklist
  - Do NOT include any attribution to "Claude", "Claude Code", "Anthropic", or similar AI tool references in either title or body
- Create the PR:
  ```bash
  gh pr create --title "<title>" --body "<body>"
  ```
- Return the PR URL to the user

If neither MCP tools nor `gh` are available:
- Inform the user that PR creation requires GitHub CLI or MCP
- Provide instructions to install `gh`
- Show the web URL they can visit to create the PR manually

### 10. Final verification
Run `git status` to confirm clean working tree. Report success with commit hash, branch pushed, and PR URL.

## Important Notes

- **NEVER** use `git commit --amend` unless explicitly requested by the user
- **NEVER** force push (`--force`) unless explicitly requested
- **NEVER** skip hooks (`--no-verify`) unless explicitly requested
- If commit fails due to pre-commit hooks, fix the issues and create a NEW commit (do not amend)
- If push fails, inform the user and suggest next steps (pull rebase, resolve conflicts, etc.)
