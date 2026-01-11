import { Agent } from '@mastra/core/agent'
import { MockMemory } from '@mastra/core/memory'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

const zhipuAI = createOpenAICompatible({
  baseURL: process.env.DEEPSEEK_BASE_URL!,
  apiKey: process.env.DEEPSEEK_API_KEY!,
  name: 'zhipu'
})

/**
 * Form Builder Agent - AI assistant for building forms
 */
export const formBuilderAgent = new Agent({
  id: 'form-builder',
  name: 'form-builder',
  description: 'AI assistant for building forms',
  instructions: 'You are a helpful form building assistant. Help users create forms by understanding their requirements.',
  model: zhipuAI('deepseek-chat'),
  memory: new MockMemory({
    enableWorkingMemory: true,
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
