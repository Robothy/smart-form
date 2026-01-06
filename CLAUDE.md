# simple-form Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-04

## Active Technologies
- TypeScript 5.x (via Next.js) + Next.js 15+, React 19+, MUI v6+, @libsql/client, drizzle-orm, zod
- TypeScript 5.7 (via Next.js 15.1) + Next.js 15.1, React 19, MUI v6, Drizzle ORM 0.36, Zod 3.24, @libsql/client 0.10 (003-publish-share)
- libSQL (embedded SQLite-compatible database) at `data/simple-form.db` (003-publish-share)
- TypeScript 5.7 (via Next.js 15.1) + React 19, MUI v6, @libsql/client, drizzle-orm 0.36, zod 3.24 (004-form-management-improvements)
- libSQL embedded SQLite database at `data/simple-form.db` (004-form-management-improvements)

## Project Structure

```text
app/                    # Next.js 15+ App Router
├── api/               # API routes
│   └── forms/        # Form CRUD and submissions
├── forms/            # Form UI pages
└── layout.tsx        # Root layout
components/
├── ui/               # Reusable UI components
└── forms/            # Form-specific components
lib/
├── db/               # Database schema and client
├── utils/            # Utility functions
└── validation/       # Zod schemas
```

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Code Style

TypeScript 5.x (via Next.js): Follow standard conventions

### Key Principles

1. **Progressive Enhancement**: Use server components by default, client components only for interactivity
2. **Component Reusability**: Wrap MUI components in custom components (Button, FormInput, etc.)
3. **Type Safety**: All code uses TypeScript strict mode with Zod validation at boundaries
4. **Database First**: Use Drizzle ORM for type-safe database operations
5. **API Standardization**: All API responses use `{ success, data, error }` format

## Architecture Decisions

### Database Design
- **libSQL** embedded database with @libsql/client
- **Drizzle ORM** for type-safe queries
- Three tables: forms, formFields, formSubmissions
- Foreign key relationships with CASCADE delete
- Published forms are immutable (draft → publish is one-way)

### Form Validation
- **Zod** schemas for all field types
- Server-side validation on all API endpoints
- Client-side validation for immediate feedback
- Field-specific rules: text (max 1000), textarea (max 10000), date (ISO format)

### URL Structure
- `/forms` - Form list with filtering
- `/forms/new` - Create new form
- `/forms/:id/edit` - Edit draft form
- `/forms/:id/fill` - Fill out form
- `/forms/:id/view` - View form details
- `/forms/:id/submissions` - View submissions
- `/forms/share/:slug` - Public share link (redirects to fill)

### State Management
- Local component state with React hooks (useState, useEffect)
- Parent synchronization via callbacks (onUpdate, onSave)
- No global state management library needed

## Recent Changes
- 004-form-management-improvements: Added TypeScript 5.7 (via Next.js 15.1) + React 19, MUI v6, @libsql/client, drizzle-orm 0.36, zod 3.24
- 004-form-management-improvements: Added TypeScript 5.7 (via Next.js 15.1) + React 19, MUI v6, @libsql/client, drizzle-orm 0.36, zod 3.24
- 003-publish-share: Added TypeScript 5.7 (via Next.js 15.1) + Next.js 15.1, React 19, MUI v6, Drizzle ORM 0.36, Zod 3.24, @libsql/client 0.10
  - Removed AI assistant components (AIAssistant, FillAssistant)
  - Removed AI API endpoints (/api/ai/*)
  - Removed AI library code (lib/ai/*)
  - Removed CopilotProvider wrapper
  - Removed AI configuration (OPENAI_API_KEY)

  - Phase 1-2: Project setup, database schema, API utilities
  - Phase 3: User Story 1 - Form creation and editing
  - Phase 4: User Story 4 - Form filling and submission
  - Phase 5: User Story 2 - Publishing with shareable slugs
  - Phase 6: User Story 3 - View submissions with pagination
  - Phase 7: User Story 7 - Form list management

<!-- MANUAL ADDITIONS START -->

## Loading States
All API calls use loading states with CircularProgress or disabled buttons:
- `isLoading` state during fetch operations
- `isSubmitting` state during form submissions
- `isSaving` state during form updates

## Error Handling
- API errors use standardized error response format
- Form errors displayed below fields
- Page errors show Alert with onClose handler
- Error boundaries for graceful degradation

## Accessibility
- Semantic HTML elements
- ARIA labels on form inputs
- Keyboard navigation support (Enter to submit forms)
- Error messages announced to screen readers

## Security
- Server-side validation on all inputs
- Zod schema validation at API boundaries
- Published forms are read-only (immutable after publish)
- Field-specific validation (max length, format checks)
- Sanitization of user inputs before database storage

<!-- MANUAL ADDITIONS END -->


DISTILLED_AESTHETICS_PROMPT = """
<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:

Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.

Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.

Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
</frontend_aesthetics>
"""