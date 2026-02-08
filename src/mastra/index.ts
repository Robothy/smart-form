import { Mastra } from '@mastra/core/mastra'
import { LibSQLStore } from '@mastra/libsql'
import { PinoLogger } from '@mastra/loggers'
import { Observability, DefaultExporter, SensitiveDataFilter } from '@mastra/observability'
import { formBuilderAgent } from './agents/form-builder'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { OtelExporter } from '@mastra/otel-exporter'
import { ObservabilityExporter } from '@mastra/core/observability'

// Ensure data directory exists before initializing Mastra
const dataDir = join(process.cwd(), '.mastra', 'data')
try {
  mkdirSync(dataDir, { recursive: true })
} catch {
  // Directory already exists or creation failed (will be caught by LibSQLStore)
}

const logLevel = (process.env.MASTRA_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info'

// Build exporters array - only include OtelExporter if OTEL_ENDPOINT is provided
const exporters: Array<ObservabilityExporter> = [new DefaultExporter()]
if (process.env.OTEL_ENDPOINT) {
  exporters.push(
    new OtelExporter({
      provider: {
        custom: {
          endpoint: process.env.OTEL_ENDPOINT,
          protocol: 'http/json',
        },
      },
      resourceAttributes: {
        'service.name': 'smart-form',
      },
    })
  )
}

export const mastra = new Mastra({
  agents: {
    formBuilder: formBuilderAgent,
  },
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters,
        includeInternalSpans: true,
        spanOutputProcessors: [new SensitiveDataFilter()],
      },
    },
  }),
  storage: new LibSQLStore({
    id: 'mastra-store',
    url: 'file:./.mastra/data/mastra.db',
  }),
  logger: new PinoLogger({ level: logLevel }),
})
