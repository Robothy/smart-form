# Research: AI-Powered Form Builder

**Feature**: 001-ai-form-builder
**Date**: 2025-12-31
**Phase**: Phase 0 - Research & Technology Decisions

## Overview

This document captures research findings and technology decisions for the AI-powered form builder feature. All technical context items from the plan have been resolved with informed decisions based on industry best practices, project constitution requirements, and the specified technology stack.

---

## 1. Next.js App Router Integration

### Decision: Use Next.js 15+ with App Router

**Rationale**:
- Next.js 15+ provides the latest App Router with React Server Components (RSC)
- Built-in SSR/SSG capabilities align with Progressive Enhancement principle
- API routes enable full-stack development without separate backend
- Excellent TypeScript support and developer experience
- Strong community momentum and long-term viability

**Alternatives Considered**:
- **Pages Router**: Older Next.js pattern, less flexibility with RSC
- **Remix**: Viable alternative but CopilotKit integration is better documented for Next.js
- **Separate frontend/backend**: Adds unnecessary complexity for this demo service

**Implementation Notes**:
- Use `app/` directory structure
- Leverage Server Components by default, Client Components (`"use client"`) only for interactivity
- Use `next.config.ts` for configuration
- Enable TypeScript strict mode in `tsconfig.json`

---

## 2. CopilotKit Integration

### Decision: Use CopilotKit with PopupChat component

**Rationale**:
- CopilotKit PopupChat provides the UI component specified in requirements
- Designed for React/Next.js with first-class TypeScript support
- Built-in context passing from React components to AI
- Supports both form design and form filling use cases
- Mastra can be used as the backend for CopilotKit via custom tools

**Alternatives Considered**:
- **Vercel AI SDK**: More flexible but requires building chat UI from scratch
- **Custom chat UI**: Would not meet requirement for "CopilotKit Popup Chat"

**Implementation Notes**:
- Wrap app with `CopilotKit` provider in root layout
- Use `useCopilotReadable` to expose form state to AI
- Use `useCopilotAction` to enable AI to modify forms
- Implement Mastra agent as CopilotKit backend tool
- Ensure form works without AI (optional/non-blocking per constitution)

---

## 3. Mastra Agent Integration

### Decision: Use Mastra with OpenAI-compatible LLM

**Rationale**:
- Mastra provides structured agent/tool abstractions
- Built-in integration with OpenAI-compatible APIs
- TypeScript-first design aligns with project constitution
- Can be deployed serverlessly or containerized
- Tools pattern matches CopilotKit's action system

**Alternatives Considered**:
- **LangChain**: More mature but heavier, Mastra is more modern/React-focused
- **Direct OpenAI SDK**: Would require more boilerplate for tool management

**Implementation Notes**:
- Create Mastra agent for form design assistance
- Create separate agent/context for form filling assistance
- Define tools: `addField`, `removeField`, `modifyField`, `suggestAnswer`
- Use environment variable for OpenAI API key
- Handle AI unavailability gracefully per edge cases

---

## 4. Form Validation Strategy

### Decision: Use Zod for client and server validation

**Rationale**:
- Zod provides TypeScript-first schema validation
- Same schema can be used on client and server (DRY principle)
- Excellent error messages out of the box
- Integrates well with React Hook Form (if needed)
- Type inference from schemas improves type safety

**Alternatives Considered**:
- **Yup**: Similar but less TypeScript-native
- **Custom validation**: More work, harder to maintain type safety
- **React Hook Form built-in**: Good but Zod is more flexible

**Implementation Notes**:
- Define Zod schemas for each field type in `lib/validation/schemas.ts`
- Create dynamic form schema builder based on form definition
- Client-side: Validate on change and on submit
- Server-side: Re-run Zod validation before storing submissions
- Return specific, actionable error messages per constitution

---

## 5. MUI Component Strategy

### Decision: Wrap MUI components in project-specific components

**Rationale**:
- Aligns with Component Reusability principle
- Enables consistent theming and styling
- Allows adding project-specific behavior (e.g., error display)
- Facilitates future component swaps or customization

**Alternatives Considered**:
- **Use MUI directly**: Violates constitution principle IV

**Implementation Notes**:
- Create `components/ui/` directory with wrapped components
- Examples: `FormInput`, `FormSelect`, `FormField`, `Button`
- Export props interfaces for reusability
- Document usage with JSDoc comments
- Each wrapper adds consistent error display, required indicators, and accessibility

---

## 6. libSQL Database Access

### Decision: Use @libsql/client with Drizzle ORM

**Rationale**:
- `@libsql/client` is the official client for libSQL
- Drizzle ORM provides type-safe database access
- Migration support out of the box
- SQL-first approach (no hidden query magic)
- Excellent TypeScript support
- Constitution specifies Drizzle as recommended option

**Alternatives Considered**:
- **better-sqlite3**: Synchronous, not ideal for Next.js serverless
- **Prisma**: Good but heavier, Drizzle is lighter for this use case

**Implementation Notes**:
- Database location: `data/simple-form.db`
- Use Drizzle Kit for migrations: `drizzle-kit push`
- Enable WAL mode in connection string for concurrency
- Create singleton client in `lib/db/client.ts`
- Define schema in `lib/db/schema.ts`
- Add `data/*.db` to `.gitignore`

---

## 7. Client/Server Component Boundaries

### Decision: Server Components by default, Client Components for interactivity

**Rationale**:
- Aligns with Progressive Enhancement principle
- Reduces client JavaScript bundle size
- Better SEO and initial load performance
- Next.js 15+ is optimized for this pattern

**Boundaries**:

**Server Components** (default):
- Form list page
- Form detail/submission page
- Form fill-in page (initial render)
- API routes

**Client Components** (`"use client"`):
- Form builder/editor
- AI chat popup
- Form filler (interactive part)
- Any component with `useState`, `useEffect`, event handlers

**Implementation Notes**:
- Keep client components minimal and focused
- Pass data from server to client via props
- Use Server Actions for mutations when possible
- Lazy-load client components with `dynamic` import

---

## 8. Shareable Link Strategy

### Decision: Use unique slug-based URLs

**Rationale**:
- More user-friendly than UUID URLs
- Easier to share and remember
- Can be generated server-side with collision detection

**Implementation Notes**:
- Generate 8-character random string (e.g., `abc123xy`)
- Check database for collisions, regenerate if needed
- Store slug in `forms` table
- Route: `/forms/share/[slug]` for public access
- No expiration per requirements

**Alternatives Considered**:
- **UUID**: Not user-friendly, longer URLs
- **Sequential ID**: Predictable, not ideal for public sharing

---

## 9. Pagination Strategy

### Decision: Cursor-based pagination with offset fallback

**Rationale**:
- Requirement: 20 submissions per page default
- Offset-based is simpler for this scale (~100 submissions per form)
- Can upgrade to cursor-based if scale increases

**Implementation Notes**:
- Default page size: 20
- Query params: `?page=1&limit=20`
- Return total count for page navigation
- Store in `lib/utils/pagination.ts` helper

---

## 10. Error Handling Standards

### Decision: Specific, actionable error messages

**Rationale**:
- Constitution requirement: "Email must contain @" not "Invalid input"
- Improves user experience
- Reduces support burden

**Implementation Notes**:
- Zod schemas with custom error messages
- Server-side validation returns field-specific errors
- Client-side displays errors below each field
- Toast notifications for success/error states

---

## 11. Performance Targets

### Decision: Meet constitution standards with monitoring

**Targets**:
- First Contentful Paint (FCP): < 2 seconds
- Time to Interactive (TTI): < 3.5 seconds
- Database queries: < 100ms typical

**Implementation Notes**:
- Use Next.js Image optimization
- Code split client components
- Lazy load AI chat component
- Index database on `forms.slug` and `submissions.formId`
- Use server components to reduce JS bundle

---

## 12. Security Considerations

### Decision: Input sanitization and safe AI usage

**Rationale**:
- Constitution requires sanitized inputs
- AI prompts must be validated to prevent injection

**Implementation Notes**:
- Zod validation on all inputs
- Parameterized queries via Drizzle (SQL injection protection)
- Limit field label/description length
- Sanitize AI-generated content before displaying
- Never expose API keys to client

---

## Summary of Decisions

| Area | Decision | Status |
|------|----------|--------|
| Framework | Next.js 15+ App Router | Resolved |
| AI Chat | CopilotKit PopupChat | Resolved |
| AI Backend | Mastra with OpenAI | Resolved |
| Validation | Zod (client + server) | Resolved |
| UI Components | MUI wrappers | Resolved |
| Database | libSQL + Drizzle ORM | Resolved |
| Component Split | Server-first, client for interactive | Resolved |
| Shareable Links | Slug-based URLs | Resolved |
| Pagination | Offset-based, 20 per page | Resolved |
| Error Messages | Specific, actionable | Resolved |

All NEEDS CLARIFICATION items from Technical Context have been resolved. Ready for Phase 1: Design & Contracts.
