# React Refactoring Agent Specification

**Version:** 1.0
**Date:** 2026-01-07
**Status:** Design Draft

---

## 1. Overview

### 1.1 Purpose
The React Refactoring Agent is an autonomous agent that analyzes React components in the simple-form codebase and applies clean code refactorings through an interactive, confirmation-based workflow.

### 1.2 Goals
- Improve code maintainability through clean code principles
- Optimize performance for Next.js 15 and React 19
- Ensure consistency with project-specific patterns
- Maintain type safety and existing functionality
- Educate developers by explaining refactoring decisions

### 1.3 Non-Goals
- Changing business logic or behavior
- Altering API contracts or data structures
- Introducing new dependencies
- Breaking existing tests or functionality

---

## 2. Project Context

### 2.1 Tech Stack
- **Framework:** Next.js 15.1 with App Router
- **UI Library:** React 19, MUI v6
- **Language:** TypeScript 5.7 (strict mode)
- **Database:** libSQL with Drizzle ORM 0.36
- **Validation:** Zod 3.24

### 2.2 Codebase Patterns

#### Component Structure
```
app/                    # Next.js App Router (server components default)
├── api/               # API routes
├── forms/            # Form UI pages
└── layout.tsx        # Root layout
components/
├── ui/               # Reusable UI components (Button, FormInput, etc.)
└── forms/            # Form-specific components
```

#### Custom Component Wrappers
Use existing wrappers instead of raw MUI:
- `Button` (wraps MUI Button)
- `FormInput` (wraps MUI TextField with validation)
- `Card` / `CardContent` / `CardActions`
- `PageToolbar` (fixed toolbar for edit pages)

#### API Pattern
All API responses use standardized format:
```typescript
{ success: boolean; data?: T; error?: string }
```

#### Database Pattern
```typescript
// Drizzle ORM with prepared statements
const form = await db.select().from(forms).where(eq(forms.id, id)).get();
```

---

## 3. Clean Code Principles

### 3.1 Component Design

#### Single Responsibility Principle (SRP)
- **Rule:** Each component should have one reason to change
- **Violation:** Component handles UI + data fetching + validation + navigation
- **Refactor:** Extract concerns to separate components/hooks

#### Component Size Limits
- **Hard Limit:** 300 lines → Split required
- **Soft Warning:** 200 lines → Consider splitting
- **Ideal Target:** 50-150 lines

#### Hook Extraction
- **Rule:** Extract complex stateful logic (>10 lines) to custom hooks
- **Pattern:** `useFormState`, `useFormSubmission`, `useFormData`, etc.

### 3.2 Code Quality

#### Naming Conventions
```typescript
// Components: PascalCase
function FormFieldEditor() { }

// Hooks: camelCase with 'use' prefix
function useFormState() { }

// Utilities/Constants: camelCase
const formatFormSlug = (name: string) => { };
const MAX_FORM_NAME_LENGTH = 100;

// Types/Interfaces: PascalCase
interface FormFieldData { }
type FormStatus = 'draft' | 'published';
```

#### DRY (Don't Repeat Yourself)
- **Violation:** Same code block appears 3+ times
- **Refactor:** Extract to component, hook, or utility function

#### Magic Values
- **Rule:** No hardcoded numbers or strings in component logic
- **Refactor:** Extract to named constants or configuration

#### Conditional Complexity
- **Rule:** Max 3 levels of nesting
- **Refactor:** Use early returns, extract to predicates, or use strategy pattern

### 3.3 Performance

#### Server vs Client Components (Next.js 15)
```typescript
// Default to server component (no 'use client')
export default function FormList() {
  // Data fetching, no interactivity → server
}

// Use 'use client' only when needed:
'use client';
export function FormEditor() {
  // Event handlers, useState, useEffect → client
}
```

#### React Performance Hooks
```typescript
// useMemo: Expensive computations
const sortedFields = useMemo(() =>
  fields.sort((a, b) => a.order - b.order),
  [fields]
);

// useCallback: Stable references for props
const handleSubmit = useCallback(() => {
  // ...
}, [dependencies]);

// React.memo: Prevent unnecessary re-renders
export const FormField = React.memo(({ field }) => {
  // ...
});
```

#### Dependency Arrays
- **Rule:** Always include all referenced values
- **Warning:** Empty deps array with referenced values = stale closure bug

#### Bundle Size
- **Rule:** Prefer dynamic imports for large/rarely-used components
```typescript
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <CircularProgress />
});
```

### 3.4 Type Safety

#### TypeScript Strict Mode
- **Rule:** No `any` types (use `unknown` with type guards)
- **Rule:** All functions have explicit return types (public API)
- **Rule:** All props have interfaces

#### Zod Validation
- **Rule:** Validate at API boundaries
- **Rule:** Infer types from schemas where possible
```typescript
const formSchema = z.object({
  name: z.string().min(1).max(100),
});
type Form = z.infer<typeof formSchema>;
```

---

## 4. Refactoring Rules

### 4.1 Component Extraction

#### Rule: Large Component
**Detection:**
- Component >200 lines
- Component >300 lines (critical)

**Solution:**
1. Identify logical sections (header, body, footer, etc.)
2. Extract each section to separate component
3. Move related state/hooks to extracted components
4. Use composition over deep nesting

**Example:**
```typescript
// Before: 250 lines
export default function FormEditor() {
  // 50 lines: header state
  // 100 lines: field list
  // 50 lines: field editor
  // 50 lines: footer actions
}

// After:
export default function FormEditor() {
  return (
    <>
      <FormEditorHeader form={form} />
      <FormFieldList fields={fields} />
      <FormFieldEditor field={selectedField} />
      <FormEditorActions onSave={handleSave} />
    </>
  );
}
```

#### Rule: Mixed Concerns
**Detection:**
- Component contains data fetching + complex UI + business logic
- Component has >3 useEffect hooks with unrelated effects

**Solution:**
1. Extract data fetching to custom hook (`useFormData`, `useFormSubmissions`)
2. Extract business logic to utility functions
3. Keep component focused on UI only

### 4.2 Hook Extraction

#### Rule: Complex State Logic
**Detection:**
- 3+ related state variables
- State updates with complex logic
- State accessed by multiple useEffects

**Solution:**
```typescript
// Extract to custom hook
function useFormState(formId: string) {
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Consolidate logic
  useEffect(() => {
    loadForm();
  }, [formId]);

  return { form, isLoading, error, refetch: loadForm };
}
```

#### Rule: Reusable Effect Pattern
**Detection:**
- Same useEffect pattern appears in 2+ components

**Solution:**
Extract to custom hook with parameters

### 4.3 Duplication Removal

#### Rule: Duplicated UI Blocks
**Detection:**
- Similar JSX structure appears 3+ times
- Differences only in props/data

**Solution:**
Extract to reusable component with variant props

#### Rule: Duplicated Logic
**Detection:**
- Same logic block appears 2+ times
- Same validation pattern repeated

**Solution:**
Extract to utility function or custom hook

### 4.4 Simplification

#### Rule: Deep Nesting
**Detection:**
- Nesting >3 levels (if/return/map/etc.)

**Solution:**
```typescript
// Before: Deep nesting
{items && items.length > 0 ? (
  <div>
    {items.map(item => (
      item.visible ? (
        <span key={item.id}>{item.name}</span>
      ) : null
    ))}
  </div>
) : null}

// After: Early returns + guards
const visibleItems = items?.filter(item => item.visible) ?? [];
if (visibleItems.length === 0) return null;

return (
  <div>
    {visibleItems.map(item => (
      <span key={item.id}>{item.name}</span>
    ))}
  </div>
);
```

#### Rule: Complex Conditionals
**Detection:**
- Ternary operators nested 2+ levels
- Boolean expressions with >3 operators
- Same condition checked multiple times

**Solution:**
Extract to predicate functions or use lookup tables

### 4.5 Performance Optimization

#### Rule: Unnecessary Re-renders
**Detection:**
- Child component re-renders on parent state change without prop changes
- Large computation runs on every render

**Solution:**
```typescript
// Wrap child in React.memo
export const FormField = React.memo(({ field, onUpdate }) => {
  // ...
}, (prev, next) => prev.field.id === next.field.id);

// Memoize expensive computations
const sortedFields = useMemo(() =>
  fields.sort(/* complex sort */),
  [fields]
);
```

#### Rule: Inefficient Lists
**Detection:**
- Large list (>100 items) without virtualization
- List items have expensive computations

**Solution:**
Consider virtualization or pagination

#### Rule: Missing Server Component Opportunity
**Detection:**
- Component marked 'use client' but has no interactivity
- Component only fetches data and renders

**Solution:**
Remove 'use client' directive, convert to server component

### 4.6 Code Organization

#### Rule: Poor Imports
**Detection:**
- Absolute imports without @ alias
- Inconsistent import ordering
- Unused imports

**Solution:**
```typescript
// Order: 1. React/Next, 2. Libraries, 3. Components, 4. Utils, 5. Types
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { Button } from '@/components/ui/button';
import { formatFormSlug } from '@/lib/utils/form-utils';
import type { Form } from '@/types/forms';
```

#### Rule: Inconsistent File Structure
**Detection:**
- Components in wrong directory (forms component in ui/)
- Page components mixed with reusable components

**Solution:**
Move to appropriate directory following project structure

---

## 5. Detection & Analysis

### 5.1 Analysis Process

1. **File Selection**
   - User provides file path, glob pattern, or agent scans project
   - Agent reads target file(s)

2. **Parsing & AST Analysis**
   - Parse TypeScript/React code
   - Identify component boundaries
   - Extract component metadata (size, hooks, imports)

3. **Rule Application**
   - Run each refactoring rule against components
   - Collect violations with severity and location

4. **Prioritization**
   - Critical: Blocks functionality or performance (>300 lines, security issues)
   - Warning: Impacts maintainability (200-300 lines, duplication)
   - Info: Minor improvements (naming, formatting)

### 5.2 Report Format

```typescript
interface RefactoringReport {
  file: string;
  component: string;
  issues: RefactoringIssue[];
  metrics: ComponentMetrics;
}

interface RefactoringIssue {
  rule: string;
  severity: 'critical' | 'warning' | 'info';
  line: number;
  message: string;
  suggestion: string;
  diff?: string; // Before/After code
}

interface ComponentMetrics {
  lines: number;
  hooks: number;
  useState: number;
  useEffect: number;
  nestingLevel: number;
  isClientComponent: boolean;
  hasApiCalls: boolean;
}
```

---

## 6. Interactive Workflow

### 6.1 User Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INITIATION                                              │
│    User runs agent:                                        │
│    "Refactor app/forms/[id]/edit/page.tsx"                 │
│    "Refactor all components in components/forms/*"         │
│    "Refactor for performance"                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ANALYSIS                                                │
│    Agent scans and analyzes components                     │
│    Displays summary:                                       │
│    "Analyzed 5 components, found 12 issues"                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ISSUE PRESENTATION                                      │
│    Agent groups issues by severity and component:          │
│                                                             │
│    📁 components/forms/FormFieldEditor.tsx (250 lines)     │
│    🔴 CRITICAL: Component too large (>200 lines)           │
│       Suggested: Extract FormFieldList component           │
│       [View Diff] [Apply] [Skip]                           │
│                                                             │
│    🟡 WARNING: Duplicated validation logic (lines 45-52)    │
│       Suggested: Extract to useFieldValidation hook        │
│       [View Diff] [Apply] [Skip]                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CONFIRMATION                                           │
│    For each issue:                                         │
│    - Ask user to [Apply] [Skip] [Apply All Like This]      │
│    - Show preview diff before applying                     │
│    - Explain rationale for refactoring                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. APPLICATION                                            │
│    Agent applies approved refactorings:                    │
│    - Creates new files for extracted components            │
│    - Updates imports                                       │
│    - Modifies original component                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. SUMMARY                                                 │
│    Agent reports changes:                                  │
│    "✅ Applied 8 refactorings:                             │
│     - Extracted 3 components                               │
│     - Created 2 custom hooks                               │
│     - Removed 2 duplications                               │
│     - Added React.memo to 1 component                      │
│                                                             │
│     Files modified: 4                                      │
│     Files created: 5                                       │
│     Lines reduced: 157 (438 → 281)"                        │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Commands & Invocations

```bash
# Refactor specific file
/refactor app/forms/[id]/edit/page.tsx

# Refactor all components in directory
/refactor components/forms/*

# Refactor for specific focus
/refactor --performance app/forms/[id]/fill/page.tsx
/refactor --organization components/ui/*
/refactor --quality app/forms/page.tsx

# Interactive mode (ask for each issue)
/refactor --interactive components/forms/FormFieldEditor.tsx

# Auto-apply non-critical issues
/refactor --auto --warning-level warning components/forms/*
```

### 6.3 Agent Prompts

The agent will use clear, educational messages:

**Analysis Complete:**
```
I've analyzed FormFieldEditor.tsx and found 5 issues:

🔴 Critical (1)
  - Component is 280 lines (limit: 200)
    → Extract FormFieldList (lines 45-130)
    → Extract FormFieldEditor (lines 135-210)

🟡 Warnings (3)
  - Duplicated validation logic (appears 3 times)
  - Missing React.memo on list items
  - Complex conditional (lines 78-95, nesting: 4)

ℹ️ Info (1)
  - Generic variable name 'data' → suggest 'formData'

Would you like me to:
1. Apply all critical issues first
2. Review each issue individually
3. See detailed plan before applying changes
```

**Before Applying Change:**
```
I'll extract FormFieldList to a new component.

This will:
✓ Create components/forms/FormFieldList.tsx (95 lines)
✓ Reduce FormFieldEditor.tsx to 185 lines
✓ Improve testability and reusability

Changes:
- Lines 45-130 → New component
- Add: import { FormFieldList } from './FormFieldList'
- Pass: fields, onFieldSelect, selectedFieldId as props

[Apply Changes] [Show Full Diff] [Skip]
```

---

## 7. Implementation

### 7.1 Agent Configuration

**Location:** `.claude/agents/react-refactor-agent.md`

**Agent Type:** General-purpose with specialized system prompt

**Tools Required:**
- `Read` - Read component files
- `Write` - Create new component files
- `Edit` - Modify existing files
- `Glob` - Find React components
- `Grep` - Search for patterns
- `Bash` - Run type-check and lint

**Access:** Full codebase access

### 7.2 System Prompt Structure

```markdown
You are the React Refactoring Agent for the simple-form project.

## Your Purpose
Analyze React components and apply clean code refactorings interactively.

## Tech Stack Context
- Next.js 15.1 with App Router
- React 19, MUI v6
- TypeScript 5.7 strict mode
- libSQL with Drizzle ORM

## Refactoring Rules
[Full rules from Section 4]

## Project Patterns
[Full patterns from Section 2.2]

## Workflow
1. Analyze the target component(s)
2. Present issues grouped by severity
3. Ask user which changes to apply
4. Show preview diff before applying
5. Apply changes with confirmation
6. Provide summary of modifications

## Important
- Always maintain type safety (no 'any')
- Don't change business logic
- Don't break existing functionality
- Explain your reasoning clearly
- Ask for confirmation before each change
```

### 7.3 Phased Implementation

#### Phase 1: Foundation (Core Rules)
- Component size detection
- Basic component extraction
- Import organization

#### Phase 2: Code Quality
- Duplication detection
- Hook extraction
- Naming improvements

#### Phase 3: Performance
- Server vs client component analysis
- React performance hooks
- Dependency array verification

#### Phase 4: Advanced
- Complex refactoring (multi-file)
- Automated test generation
- Documentation updates

---

## 8. Testing & Validation

### 8.1 Pre-Refactoring Checks
- Run `npm run type-check` → Must pass
- Run `npm run lint` → Must pass
- Identify existing test files

### 8.2 Post-Refactoring Validation
- Run `npm run type-check` → Must pass
- Run `npm run lint` → Must pass
- Run existing tests → Must pass
- Verify no console errors
- Manual smoke test of affected features

### 8.3 Rollback Strategy
- Agent creates git commit before refactoring
- If validation fails: `git reset --hard HEAD~1`
- Report error to user and halt

---

## 9. Edge Cases & Limitations

### 9.1 What Agent Won't Do
- Refactor components with active TODO comments (without confirmation)
- Modify files outside the specified scope
- Change business logic or API contracts
- Refactor during active merge conflicts
- Modify generated files or node_modules

### 9.2 Handling Uncertainty
When agent is unsure:
1. Ask user for clarification
2. Present options with trade-offs
3. Default to conservative approach (skip change)

### 9.3 Known Limitations
- May not recognize all project-specific patterns
- Can't guarantee runtime behavior (requires testing)
- May suggest refactorings that conflict with future requirements
- Limited by static analysis (won't catch runtime issues)

---

## 10. Future Enhancements

### 10.1 Planned Features
- **Automated test generation:** Create tests for extracted components
- **Documentation:** Auto-generate JSDoc for components
- **Batch mode:** Apply same refactoring across multiple files
- **Config:** Custom rules via config file
- **Integration:** VS Code extension for real-time suggestions

### 10.2 Advanced Analysis
- **Dependency graph:** Visualize component dependencies
- **Complexity metrics:** Cyclomatic complexity, maintainability index
- **Performance profiling:** Identify slow renders
- **Accessibility:** Detect a11y violations during refactoring

---

## 11. Glossary

- **Server Component:** React Component that runs only on the server (Next.js 15)
- **Client Component:** React Component with 'use client' directive (interactive)
- **Custom Hook:** Reusable function starting with 'use' that uses React hooks
- **Extraction:** Moving code to a separate component/hook/function
- **SRP:** Single Responsibility Principle - one reason to change
- **DRY:** Don't Repeat Yourself - avoid duplication
- **Memoization:** Caching computed values to avoid re-computation

---

## Appendix A: Quick Reference

### Common Refactorings

| Issue | Detection | Solution |
|-------|-----------|----------|
| Large component | >200 lines | Extract sub-components |
| Complex state | 3+ useState | Extract custom hook |
| Duplicated code | Same block 3x | Extract to component/util |
| Deep nesting | >3 levels | Early returns, guards |
| Slow render | Computation on render | useMemo, React.memo |
| Wrong component type | 'use client' without interactivity | Remove 'use client' |

### Project Constants

```typescript
// Component size limits
const MAX_COMPONENT_LINES = 200;
const CRITICAL_COMPONENT_LINES = 300;

// Nesting limits
const MAX_NESTING_LEVEL = 3;

// Duplication threshold
const DUPLICATION_THRESHOLD = 3; // occurrences
```

---

**End of Specification**
