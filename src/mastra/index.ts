import { Mastra } from '@mastra/core/mastra'
import { LibSQLStore } from '@mastra/libsql'
import { PinoLogger } from '@mastra/loggers'
import {
  Observability,
  DefaultExporter,
  SensitiveDataFilter,
} from '@mastra/observability'
import { formBuilderAgent } from './agents/form-builder'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

// Ensure data directory exists before initializing Mastra
const dataDir = join(process.cwd(), '.mastra', 'data')
try {
  mkdirSync(dataDir, { recursive: true })
} catch {
  // Directory already exists or creation failed (will be caught by LibSQLStore)
}

const logLevel = process.env.MASTRA_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error' || 'info'

export const mastra = new Mastra({
  agents: {
    formBuilder: formBuilderAgent,
  },
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new DefaultExporter(),
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(),
        ],
      },
    },
  }),
  storage: new LibSQLStore({
    id: 'mastra-store',
    url: 'file:./.mastra/data/mastra.db',
  }),
  logger: new PinoLogger({ level: logLevel }),
})
