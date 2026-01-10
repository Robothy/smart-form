# Runtime Configuration

Advanced setup for CopilotRuntime endpoint with Mastra agents.

## Endpoint Configuration

### Basic Setup

```typescript
// app/api/copilotkit/route.ts
import { mastra } from '@/src/mastra'
import { CopilotRuntime, ExperimentalEmptyAdapter, copilotRuntimeNextJSAppRouterEndpoint } from '@copilotkit/runtime'
import { MastraAgent } from '@ag-ui/mastra'
import { NextRequest } from 'next/server'

export const POST = async (req: NextRequest) => {
  const mastraAgents = MastraAgent.getLocalAgents({
    mastra,
    resourceId: 'copilotkit',  // Required: any string identifier
  })

  const runtime = new CopilotRuntime({
    agents: mastraAgents,
  })

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: '/api/copilotkit',
  })

  return handleRequest(req)
}
```

## Configuration Options

### CopilotRuntime Options

```typescript
const runtime = new CopilotRuntime({
  agents: mastraAgents,
  debug: true,                  // Enable debug logging
  remoteAdapter: adapter,       // Custom adapter for backend tools
})
```

### Service Adapters

#### ExperimentalEmptyAdapter (Frontend-Only Tools)

```typescript
import { ExperimentalEmptyAdapter } from '@copilotkit/runtime'

serviceAdapter: new ExperimentalEmptyAdapter()
```

**Use when:** All tools are frontend-only via `useFrontendTool`

#### OpenAIAdapter (Backend Tool Execution)

```typescript
import { OpenAIAdapter } from '@copilotkit/runtime'

serviceAdapter: new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
})
```

**Use when:** Agent needs to execute backend tools (API calls, database queries)

## Multiple Agents

### Register Multiple Agents

```typescript
// src/mastra/index.ts
import { formBuilderAgent } from './agents/form-builder'
import { surveyAgent } from './agents/survey'

export const mastra = new Mastra({
  agents: {
    formBuilder: formBuilderAgent,
    survey: surveyAgent,
  },
})
```

### Dynamic Agent Selection Per Page

```typescript
// app/layout.tsx - Default agent
<CopilotKit runtimeUrl="/api/copilotkit" agent="formBuilder">
  {children}
</CopilotKit>

// app/survey/page.tsx - Override for specific page
<CopilotKit runtimeUrl="/api/copilotkit" agent="survey">
  <SurveyBuilder />
</CopilotKit>
```

### Programmatic Agent Selection

```typescript
function Assistant({ agentId }: { agentId: string }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent={agentId}>
      {/* ... */}
    </CopilotKit>
  )
}
```

## Runtime Info Endpoint

Create an endpoint to verify agent registration:

```typescript
// app/api/copilotkit/info/route.ts
import { mastra } from '@/src/mastra'
import { MastraAgent } from '@ag-ui/mastra'
import { NextResponse } from 'next/server'

export const GET = async () => {
  const agents = MastraAgent.getLocalAgents({
    mastra,
    resourceId: 'info',
  })

  return NextResponse.json({
    agents: Object.keys(agents),
  })
}
```

**Usage:**
```bash
curl http://localhost:3000/api/copilotkit/info
# Response: { "agents": ["formBuilder", "survey"] }
```

## Error Handling

### Try-Catch Wrapper

```typescript
export const POST = async (req: NextRequest) => {
  try {
    const mastraAgents = MastraAgent.getLocalAgents({
      mastra,
      resourceId: 'copilotkit',
    })

    const runtime = new CopilotRuntime({
      agents: mastraAgents,
    })

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter: new ExperimentalEmptyAdapter(),
      endpoint: '/api/copilotkit',
    })

    return handleRequest(req)
  } catch (error) {
    console.error('CopilotRuntime error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Performance

### Cache Agent Definitions

```typescript
// Cache outside handler for performance
const cachedAgents = MastraAgent.getLocalAgents({
  mastra,
  resourceId: 'copilotkit',
})

export const POST = async (req: NextRequest) => {
  const runtime = new CopilotRuntime({
    agents: cachedAgents,  // Reuse cached
  })
  // ...
}
```

### Edge Runtime (Optional)

```typescript
// app/api/copilotkit/route.ts
export const runtime = 'edge'

export const POST = async (req: NextRequest) => {
  // Edge-compatible setup
}
```
