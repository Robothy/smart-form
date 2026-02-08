import { Agent } from '@mastra/core/agent'
import { MockMemory } from '@mastra/core/memory'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

// Validate required environment variables
const requiredEnvVars = {
  OPENAI_COMPATIBLE_BASE_URL: process.env.OPENAI_COMPATIBLE_BASE_URL,
  OPENAI_COMPATIBLE_API_KEY: process.env.OPENAI_COMPATIBLE_API_KEY,
  OPENAI_COMPATIBLE_MODEL_ID: process.env.OPENAI_COMPATIBLE_MODEL_ID,
}

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables for Form Builder Agent:\n` +
    `  - ${missingVars.join('\n  - ')}\n\n` +
    `Please set these in your .env.local file. See .env.local.example for reference.`
  )
}

const llm = createOpenAICompatible({
  baseURL: process.env.OPENAI_COMPATIBLE_BASE_URL!,
  apiKey: process.env.OPENAI_COMPATIBLE_API_KEY!,
  name: 'openai-compatible'
})

/**
 * Form Builder Agent - AI assistant for building forms
 */
export const formBuilderAgent = new Agent({
  id: 'form-builder',
  name: 'form-builder',
  description: 'AI assistant for building forms',
  instructions: 'You are a helpful form building assistant. Help users create forms by understanding their requirements.',
  model: llm(process.env.OPENAI_COMPATIBLE_MODEL_ID!),
  memory: new MockMemory({
    enableWorkingMemory: false,
    enableMessageHistory: true,
    workingMemoryTemplate: `# Form Building Context

## Current Project
- Project Goal:
- Form Status:
- Previous Changes:

## User Preferences
- Communication Style:
- Common Field Types:
`,
  }),
})

export default formBuilderAgent
