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

### 5. Security check for secrets
Analyze the staged changes for potential secrets or sensitive information. Check for:

**Common secret patterns:**
- API keys: `sk-`, `api_key`, `apikey`, `API_KEY`
- Tokens: `token`, `bearer`, `jwt`, `JWT`, `access_token`
- Passwords: `password`, `passwd`, `PASSWORD`
- Secrets: `secret`, `SECRET`, `private_key`, `PRIVATE_KEY`
- Database: `mongodb://`, `postgresql://`, `mysql://`, `redis://`
- AWS: `AKIA[0-9A-Z]{16}`, `aws_access_key`
- GitHub: `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`
- URLs with credentials: `://.*:.*@`
- Base64 that looks like keys (long base64 strings)

Run `git diff --staged` and grep for sensitive patterns:
```bash
git diff --staged | grep -iE "(sk-[a-zA-Z0-9]{20,}|API_KEY|SECRET|PASSWORD|TOKEN|PRIVATE_KEY|mongodb://|postgresql://|mysql://|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36}|://.*:.*@)"
```

**If secrets are detected:**
- Show the user what was found (file and line, with the secret partially redacted)
- Use `AskUserQuestion` tool with:
  - Header: "Secrets detected"
  - Question: "⚠️ Potential secrets detected in commit! Do you want to proceed anyway?"
  - Options:
    - "No, stop" (Recommended): Stop and let user remove secrets
    - "Yes, proceed": Continue with commit despite the risk
- If "No, stop" selected: advise user to remove the secrets and re-stage changes
- If "Yes, proceed" selected: continue to commit step

**If no secrets are detected:**
- Continue to next step

### 6. Draft commit message
- If user provided a commit message in $ARGUMENTS, use that
- Otherwise, analyze changes and draft a concise commit message following the repository's style
- The commit message should:
  - Start with a verb (Add, Fix, Refactor, Remove, Update, etc.)
  - Be 1-2 sentences describing what changed and why
  - NOT include file listings or technical details
  - **CRITICAL:** Do NOT include any attribution to "Claude", "Claude Code", "Anthropic", or similar AI tool or email references

### 7. Create the commit
Run `git commit` with the drafted message:
```bash
git commit -m "<commit message>"
```
Then run `git status` to verify commit succeeded.

### 8. Push to remote
- Check if branch has an upstream: `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
- If no upstream: `git push -u origin <branch>`
- If upstream exists: `git push`

### 9. Create Pull Request
Use the GitHub MCP `create_pull_request` tool to create the PR target to the `main` branch:
- Draft PR title and body:
  - Title: Concise description (can use commit message or user-provided title)
  - Body: Include summary of changes with a test plan checklist
  - **CRITICAL:** Do NOT include any attribution to "Claude", "Claude Code", "Anthropic", or similar AI tool or email references in either title or body
- Create the PR using `mcp__github__create_pull_request`
- Return the PR URL to the user

### 10. Switch back to main
After PR is created, switch back to main branch:
```bash
git checkout main
```

### 11. Final verification
Run `git status` to confirm clean working tree. Report success with commit hash, branch pushed, and PR URL.

## Important Notes

- **NEVER** use `git commit --amend` unless explicitly requested by the user
- **NEVER** force push (`--force`) unless explicitly requested
- **NEVER** skip hooks (`--no-verify`) unless explicitly requested
- If commit fails due to pre-commit hooks, fix the issues and create a NEW commit (do not amend)
- If push fails, inform the user and suggest next steps (pull rebase, resolve conflicts, etc.)
- **CRITICAL:** Never include any attribution to "Claude", "Claude Code", "Anthropic", or similar AI tool or email references in either PR title or body, or commit messages.
