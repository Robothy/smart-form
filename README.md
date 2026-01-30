# FormForge

A modern form builder with AI assistance. Create, publish, and share beautiful forms—powered by an AI assistant that helps you design and fill forms.

## Features

- **AI Assistant** – Sidebar AI companion (powered by CopilotKit & Mastra) helps with form design and auto-filling
- **Form Builder** – Create forms with text, textarea, date, radio, and checkbox fields
- **Share & Publish** – Generate public shareable links
- **Submission Management** – View and collect responses

## Configuration

Copy `.env.local.example` to `.env.local` and configure your LLM:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your API credentials:

```env
# Database
DATABASE_URL="file:data/simple-form.db"

# OpenAI-compatible LLM API
OPENAI_COMPATIBLE_BASE_URL=https://api.deepseek.com/v1
OPENAI_COMPATIBLE_API_KEY=your_api_key_here
OPENAI_COMPATIBLE_MODEL_ID=deepseek-chat
```

Works with any OpenAI-compatible provider (DeepSeek, OpenAI, Together, local LLMs, etc.).

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Tech Stack

Next.js 15 · React 19 · TypeScript · MUI v6 · libSQL · Drizzle ORM · CopilotKit · Mastra

## License

MIT
