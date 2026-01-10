# Getting Started

Initial setup for CopilotKit + Mastra integration.

## Installation

```bash
# Core packages
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime

# Mastra integration
npm install @ag-ui/mastra @mastra/core
```

**Note:** If you encounter peer dependency conflicts, use `--legacy-peer-deps`:
```bash
npm install @copilotkit/react-core @copilotkit/react-ui --legacy-peer-deps
```

## Essential Setup (3 files)

### 1. Runtime Endpoint
**File:** `app/api/copilotkit/route.ts`

```typescript
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

### 2. Root Provider
**File:** `app/layout.tsx`

```typescript
import '@copilotkit/react-ui/styles.css'
import { CopilotKit } from '@copilotkit/react-core'

<CopilotKit runtimeUrl="/api/copilotkit" agent="myAgent">
  {children}
</CopilotKit>
```

**Critical:** `agent="myAgent"` must match the registered agent key (see Agent Registration below).

### 3. Agent Registration
**File:** `src/mastra/index.ts`

```typescript
import { Mastra } from '@mastra/core/mastra'
import { myAgent } from './agents/my-agent'

export const mastra = new Mastra({
  agents: {
    myAgent: myAgent,  // This key becomes agent="myAgent"
  },
})
```

**Agent ID Resolution:**
```typescript
// Agent definition
id: 'my-agent'        // kebab-case in Agent()

// Mastra registration
myAgent: myAgent      // camelCase key in Mastra()

// CopilotKit provider
agent="myAgent"       // exact key match - must match Mastra key
```

## Verify Setup

### Check Registered Agents

Create optional info endpoint:
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

### Test the Setup

```bash
# Check registered agents
curl http://localhost:3000/api/copilotkit/info

# Should return: { "agents": ["myAgent"] }
```

## Next Steps

- **[frontend-tools.md](frontend-tools.md)** - Define frontend tools for agent actions
- **[component-integration.md](component-integration.md)** - Add CopilotPopup/Sidebar to your UI
- **[runtime-configuration.md](runtime-configuration.md)** - Advanced runtime configuration
