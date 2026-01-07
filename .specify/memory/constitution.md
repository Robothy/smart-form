<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.1 → 2.0.0
Rationale: MAJOR - Removed Principle II (AI-Native Design) following removal of AI features from codebase (002-remove-ai branch). This is a backward-incompatible governance change as it removes a core design principle.

Modified Sections:
- Principle II (AI-Native Design) → REMOVED
- Principle V (Progressive Enhancement) → Renumbered to Principle II
- Subsequent principles renumbered accordingly

Removed Sections:
- II. AI-Native Design (entire principle removed)

Templates Status:
- .specify/templates/plan-template.md: ✅ Updated - Removed AI-Native Design from Constitution Check, renumbered principles
- .specify/templates/spec-template.md: ✅ No changes needed
- .specify/templates/tasks-template.md: ✅ No changes needed

Follow-up TODOs: None
-->

# Simple Form Constitution

## Core Principles

### I. Type Safety

Every module MUST use TypeScript with strict mode enabled. No implicit `any` types are permitted. All functions MUST have explicit return types. Props interfaces MUST be exported for reusable components. Dependencies MUST be type-safe (avoid `@ts-ignore`, `any`, or `as` casts without justification).

**Rationale**: The project uses TypeScript throughout. Type safety catches errors at compile time, improves IDE support, and serves as inline documentation.

### II. Form Validation First

Validation MUST run on the client before submission. Server-side validation is mandatory for all inputs. Error messages MUST be specific and actionable (e.g., "Email must contain @" not "Invalid input"). Validation rules MUST be defined once and reused (DRY). Form state MUST be clearly communicated to users (loading, error, success, disabled).

**Rationale**: Forms are the core feature. Poor validation causes user frustration and security issues.

### III. Component Reusability

UI components built with MUI MUST be wrapped in project-specific components. Custom components MUST accept variant props for flexibility. Components MUST be documented with usage examples. Components MUST be tested independently.

**Rationale**: MUI provides the base, but direct usage throughout the codebase creates inconsistency and harder maintenance.

### IV. Progressive Enhancement

Core form functionality MUST work without JavaScript (where feasible). Pages MUST use Next.js App Router with appropriate client/server component boundaries. Client components MUST be minimized to only what requires interactivity. Initial page load MUST be fast (< 2s First Contentful Paint target).

**Rationale**: Next.js supports SSR/SSG for performance. Not everything needs to be a client component.

## Development Workflow

### Branch Strategy

- `master`: Production-ready code
- `feature/*`: Feature development branches
- `fix/*`: Bugfix branches

### Commit Conventions

Commits MUST follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring without behavior change
- `test:` Adding or updating tests
- `chore:` Build/configuration changes

### Code Review Requirements

All changes MUST pass:
1. TypeScript compilation with no errors (`tsc --noEmit`)
2. Linter checks (`npm run lint`)
3. Automated tests (if present)
4. Manual review for security implications

## Data & Storage

### Database

- **Primary Storage**: libSQL is the designated database for this project
- **File Location**: Database file MUST be stored at project root as `data/simple-form.db`
- **Access Pattern**: Use `@libsql/client` or type-safe wrapper (e.g., `drizzle-orm`) for database access
- **Migrations**: All schema changes MUST be tracked via migration files
- **Backup**: Database file MUST be included in `.gitignore` - do not commit production data

**Rationale**: libSQL is a fork of SQLite with enhanced features including remote replication, better concurrency, and async I/O support while maintaining compatibility with the SQLite ecosystem. Ideal for form applications with straightforward persistence needs.

### Data Integrity

- All database writes MUST be wrapped in transactions
- Foreign key constraints MUST be enforced
- Connection MUST use WAL (Write-Ahead Logging) mode for concurrency
- Database MUST be VACUUMed periodically for file size management

## Quality Standards

### Performance

- First Contentful Paint: < 2 seconds
- Time to Interactive: < 3.5 seconds
- Client JavaScript bundle: Minimize via code splitting
- Database queries: < 100ms for typical operations

### Accessibility

- All form inputs MUST have associated labels
- Error messages MUST be announced to screen readers
- Keyboard navigation MUST be supported
- Color contrast MUST meet WCAG AA standards

### Security

- User inputs MUST be sanitized on both client and server
- API keys MUST NOT be committed to repository
- SQL injection MUST be prevented via parameterized queries only
- Published forms are read-only (immutable after publish)

## Governance

This constitution governs all development for the Simple Form project. It supersedes conflicting practices or habits.

**Amendment Procedure**:
1. Propose changes via pull request to this document
2. Include rationale and impact analysis
3. Update templates as needed per Sync Impact Report
4. Version MUST increment according to semantic versioning

**Versioning Policy**:
- MAJOR: Principle removal or backward-incompatible governance changes
- MINOR: New principle or section added
- PATCH: Clarifications, wording improvements, non-semantic changes

**Compliance**:
- All plan.md documents MUST include a Constitution Check section
- Features violating principles MUST document justification in Complexity Tracking table
- Reviewers MUST verify constitution compliance

**Version**: 2.0.0 | **Ratified**: 2025-12-31 | **Last Amended**: 2026-01-05
