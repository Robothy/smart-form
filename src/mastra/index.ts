import { Mastra } from '@mastra/core/mastra'
import { LibSQLStore } from '@mastra/libsql'
import { Observability } from '@mastra/observability'
import { formBuilderAgent } from './agents/form-builder'

export const mastra = new Mastra({
  agents: {
    formBuilder: formBuilderAgent,
  },
  observability: new Observability({
    default: { enabled: true },
  }),
  storage: new LibSQLStore({
    id: 'mastra-store',
    url: 'file:./.mastra/data/mastra.db',
  }),
})
