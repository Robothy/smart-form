import { Mastra } from '@mastra/core/mastra'
import { formBuilderAgent } from './agents/form-builder'

export const mastra = new Mastra({
  agents: {
    formBuilder: formBuilderAgent,
  },
})
