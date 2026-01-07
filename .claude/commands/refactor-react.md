# /refactor

React Refactoring Agent - Analyze and refactor React components following clean code principles.

## Usage

```bash
# Refactor a specific file
/refactor components/forms/FormFieldEditor.tsx

# Refactor all components in a directory
/refactor components/forms/*

# Refactor the current file (when invoked in a file)
/refactor
```

## What It Does

The React Refactoring Agent will:

1. **Analyze** the target component(s) for clean code violations
2. **Report** issues grouped by severity (critical, warning, info)
3. **Suggest** specific refactorings with clear explanations
4. **Ask** for your confirmation before applying each change
5. **Validate** that type-check and lint pass after changes

## Current Capabilities (Phase 1)

- **Component Size Detection:** Identifies components over 200/300 lines
- **Component Extraction:** Suggests extracting logical sections
- **Import Organization:** Reorganizes imports following project standards

## Project Context

The agent is configured for this specific codebase:
- Next.js 15.1 with App Router
- React 19, MUI v6
- TypeScript 5.7 strict mode
- Custom component wrappers (Button, FormInput, etc.)
- Drizzle ORM with libSQL

## Examples

```bash
# Refactor a form component
/refactor app/forms/[id]/edit/page.tsx

# Refactor all form components
/refactor components/forms/*

# Check for issues before applying
# The agent will always ask for confirmation
```

## See Also

- Specification: `.claude/agents/react-refactor-agent.md`
- Skill definition: `.claude/skills/refactor-react.md`
