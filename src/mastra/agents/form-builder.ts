import { Agent } from '@mastra/core/agent'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

const zhipuAI = createOpenAICompatible({
  baseURL: process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: process.env.ZHIPU_API_KEY || '',
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
  model: zhipuAI('glm-4.7'),
})

export default formBuilderAgent
