# Quickstart: AI-Powered Form Builder

**Feature**: 001-ai-form-builder
**Date**: 2025-12-31
**Phase**: Phase 1 - Quickstart Guide

## Overview

This guide helps you quickly set up and start using the AI-powered form builder. Follow these steps to get the application running in minutes.

---

## Prerequisites

- **Node.js**: v20+ (LTS recommended)
- **npm**: v9+ or **pnpm**: v8+
- **Git**: For version control
- **OpenAI API Key**: Optional, for AI features

---

## Installation

### 1. Clone or Initialize the Project

```bash
# If starting from scratch
npm create next-app@latest simple-form --typescript --tailwind --app

# Navigate to project
cd simple-form

# Or clone existing project
git clone <repository-url>
cd simple-form
```

### 2. Install Dependencies

```bash
npm install
```

Or with pnpm:
```bash
pnpm install
```

### 3. Install Required Packages

```bash
# Core framework and UI
npm install next@latest react@latest react-dom@latest @mui/material @emotion/react @emotion/styled

# Database and ORM
npm install @libsql/client drizzle-orm

# Validation
npm install zod

# AI (optional but recommended)
npm install @copilotkit/react-core @copilotkit/react-ui
npm install @mastra/core
```

---

## Environment Setup

Create a `.env.local` file in the project root:

```bash
# Database (libSQL)
DATABASE_URL="file:data/simple-form.db"

# OpenAI API (for AI features - optional)
OPENAI_API_KEY="sk-..."

# Optional: Use a different LLM provider
LLM_MODEL="gpt-4o-mini"
LLM_BASE_URL="https://api.openai.com/v1"
```

**Note**: Without an OpenAI API key, the AI features will be unavailable, but the core form functionality will work normally.

---

## Database Setup

### 1. Create Database Directory

```bash
mkdir -p data
```

### 2. Create Drizzle Config

Create `drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:data/simple-form.db',
  },
})
```

### 3. Generate and Apply Migrations

```bash
# Generate migration files
npx drizzle-kit generate

# Push schema to database (development)
npx drizzle-kit push
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

---

## First-Time Walkthrough

### 1. Create Your First Form

1. Navigate to `http://localhost:3000/forms/new`
2. Enter a form title (e.g., "Customer Feedback")
3. Optionally add a description
4. Click "Save Draft"

### 2. Add Fields to Your Form

1. On the form editor, click "Add Field"
2. Select a field type:
   - **Text**: Short text input
   - **Textarea**: Long text input
   - **Date**: Date picker
   - **Radio**: Single-select options
   - **Checkbox**: Multi-select options
3. Enter the field label (e.g., "Your Name")
4. Mark as required if needed
5. For Radio/Checkbox, add options
6. Click "Add Field" to save

### 3. Publish Your Form

1. After adding fields, click "Publish Form"
2. A shareable link will be generated
3. The form is now read-only and ready for submissions

### 4. Share and Collect Submissions

1. Copy the shareable link
2. Share it with users (e.g., `http://localhost:3000/forms/share/abc123xy`)
3. Users can fill out the form anonymously
4. View submissions on the form detail page

---

## AI Assistant Usage (Optional)

### AI for Form Design

1. While editing a form, click the AI chat button (bottom-right)
2. Ask questions like:
   - "Add a rating field with options 1-5"
   - "What fields should I add for a survey?"
   - "Help me create a contact form"
3. The AI will suggest or add fields to your form
4. Review and approve the changes

### AI for Form Filling

1. While filling out a shared form, click the AI chat button
2. Ask questions like:
   - "What does this question mean?"
   - "Can you suggest an answer?"
3. The AI provides explanations and suggestions
4. Manually accept suggestions if desired

---

## Project Structure

```
simple-form/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with CopilotKit
│   ├── forms/               # Form pages
│   └── api/                 # API routes
├── lib/
│   ├── db/                  # Database client and schema
│   ├── ai/                  # AI integration
│   ├── validation/          # Zod schemas
│   └── utils/               # Helper utilities
├── components/
│   ├── ui/                  # MUI wrapper components
│   └── forms/               # Form-specific components
├── data/
│   └── simple-form.db       # libSQL database (gitignored)
└── drizzle/                 # Database migrations
```

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build           # Build for production
npm start               # Start production server

# Database
npx drizzle-kit generate  # Generate migrations
npx drizzle-kit push       # Push schema to database
npx drizzle-kit studio     # Open database GUI

# Type checking
npm run type-check      # Run TypeScript compiler

# Linting
npm run lint            # Run ESLint

# Testing
npm run test            # Run tests
npm run test:watch      # Watch mode
```

---

## Troubleshooting

### Database File Not Found

```bash
# Create the data directory
mkdir -p data

# Run migrations again
npx drizzle-kit push
```

### OpenAI API Key Not Working

1. Verify your key is valid in the OpenAI dashboard
2. Check `.env.local` is not committed to git
3. Restart the dev server after adding the key

### Port Already in Use

```bash
# Use a different port
PORT=3001 npm run dev
```

### TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. **Read the Data Model**: Understand the schema at `specs/001-ai-form-builder/data-model.md`
2. **Review API Contracts**: See available endpoints at `specs/001-ai-form-builder/contracts/api.md`
3. **Check Research**: Technology decisions at `specs/001-ai-form-builder/research.md`
4. **Read the Constitution**: Project governance at `.specify/memory/constitution.md`

---

## Getting Help

- Check the feature specification: `specs/001-ai-form-builder/spec.md`
- Review the implementation plan: `specs/001-ai-form-builder/plan.md`
- Run `/speckit.tasks` to generate implementation tasks
- Run `/speckit.implement` to start implementing

---

## Constitution Compliance

This quickstart follows the project constitution principles:

- **Type Safety**: TypeScript strict mode enabled throughout
- **AI-Native Design**: CopilotKit integration points documented
- **Form Validation First**: Zod validation on client and server
- **Component Reusability**: MUI wrappers in `components/ui/`
- **Progressive Enhancement**: Server Components by default
