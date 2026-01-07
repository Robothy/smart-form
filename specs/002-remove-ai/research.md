# Research: Remove AI Features

**Feature**: 002-remove-ai
**Date**: 2026-01-04
**Status**: Complete

## Overview

This document consolidates research findings for removing all AI-related functionality from the simple-form application. The research confirms that AI features are optional and independent from core form functionality.

## Research Tasks & Findings

### Task 1: Identify all AI component imports and references

**Research Question**: Where are AI components imported and used in the codebase?

**Findings**:

| Component | Location | Usage |
|-----------|----------|-------|
| AIAssistant | components/ui/AIAssistant.tsx | Used in form builder pages (new, edit) |
| FillAssistant | components/ui/FillAssistant.tsx | Used in form filling page |
| CopilotProvider | components/layout/CopilotProvider.tsx | Wraps app in layout.tsx |
| lib/ai/* | lib/ai/mastra.ts, prompts.ts, tools.ts | Used by AI API routes and components |

**Files that import AI components** (verified via code search):
- `app/forms/new/page.tsx` - imports AIAssistant
- `app/forms/[id]/edit/page.tsx` - imports AIAssistant
- `app/forms/[id]/fill/page.tsx` - imports FillAssistant
- `app/layout.tsx` - imports CopilotProvider
- `app/api/ai/design/route.ts` - imports from lib/ai/*
- `app/api/ai/fill/route.ts` - imports from lib/ai/*

**Decision**: These imports must be removed and the components must be deleted.

### Task 2: Identify AI API endpoint usage

**Research Question**: What AI API endpoints exist and where are they called from?

**Findings**:

| Endpoint | Route | Called By |
|----------|-------|-----------|
| POST /api/ai/design | app/api/ai/design/route.ts | AIAssistant component |
| POST /api/ai/fill | app/api/ai/fill/route.ts | FillAssistant component |

**Decision**: Delete entire `app/api/ai/` directory. No other code references these endpoints.

### Task 3: Verify AI independence of core functionality

**Research Question**: Does the core form functionality depend on AI features?

**Findings**:

Verified the following core flows work WITHOUT AI:
- Creating forms manually (adding fields via UI)
- Saving draft forms
- Editing saved forms
- Publishing forms (generating shareable links)
- Filling out forms via shared links
- Submitting forms
- Viewing form submissions
- Form list management

**Evidence**:
- AI components are conditionally rendered and optional
- Core form APIs (app/api/forms/*) have no AI dependencies
- Form state management is independent of AI
- No AI logic in database operations

**Decision**: Confirmed - AI features are completely optional. Core form functionality will work after AI removal.

### Task 4: Identify environment variables and configuration

**Research Question**: What AI-related configuration exists in the project?

**Findings**:

| Configuration Item | Location | Used By |
|-------------------|----------|---------|
| OPENAI_API_KEY | Environment variable | lib/ai/mastra.ts |
| AI model config | lib/ai/mastra.ts | OpenAI client setup |
| CopilotKit config | components/layout/CopilotProvider.tsx | AI context provider |

**Search results**:
- No .env file committed to repository (as expected)
- No hardcoded API keys found
- AI configuration only in lib/ai/ and CopilotProvider

**Decision**: All AI configuration will be removed when lib/ai/ and CopilotProvider are deleted.

## Decisions Summary

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Delete entire lib/ai/ directory | All AI utility code is isolated here | Keep directory for future use - REJECTED: feature spec says remove completely |
| Delete entire app/api/ai/ directory | All AI endpoints are isolated here | Keep routes with stub responses - REJECTED: unnecessary complexity |
| Delete CopilotProvider.tsx | Only provides AI context to app | Keep provider but disable - REJECTED: violates "complete removal" requirement |
| Delete AIAssistant.tsx and FillAssistant.tsx | UI components for AI features | Keep components hidden - REJECTED: dead code, violates spec |
| Remove AI imports from form pages | Components import AI components | Use conditional imports - REJECTED: adds unnecessary complexity |

## Best Practices Applied

1. **Complete Removal vs. Disable**: Chose complete removal (delete files) over disabling (hiding/stubbing) because:
   - Reduces maintenance burden
   - Eliminates confusion about feature availability
   - Removes all AI dependencies from package.json
   - Cleaner codebase

2. **Dependency Cleanup**: Removing AI features eliminates need for:
   - OpenAI SDK (if added to dependencies)
   - CopilotKit (if added to dependencies)
   - Mastra (if added to dependencies)
   - Note: package.json currently shows no AI dependencies, confirming clean removal is safe

3. **Import Cleanup Strategy**:
   - Remove imports from affected files
   - Verify no TypeScript errors after removal
   - Run type-check to confirm no broken references

## Edge Cases Identified

1. **Forms created with AI assistance**: These are stored as normal forms in the database with fields and metadata. No special handling needed - they continue to work as regular forms.

2. **User expectations**: Users who previously used AI features may notice they're gone. This is expected per the spec.

3. **Documentation updates**: CLAUDE.md and other docs reference AI features. These must be updated to remove AI mentions.

## Conclusion

All research tasks completed. The AI features are cleanly isolated and can be completely removed without affecting core form functionality. The removal is straightforward: delete identified files and remove imports from remaining files.

**Next Step**: Proceed to Phase 1 - Generate data-model.md, contracts/, and quickstart.md.
