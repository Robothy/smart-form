# Agent Memory Configuration

Guide to configuring memory for Mastra agents in CopilotKit integration.

## Overview

When using CopilotKit with Mastra agents, the integration automatically passes `resourceId` and `threadId` for conversation continuity. Your agent must have memory configured to handle these parameters, otherwise you'll see a warning:

```
[Agent:myAgent] - No memory is configured but resourceId and threadId were passed in args. This will not work.
```

## Quick Fix

Add `MockMemory` from `@mastra/core/memory` to your agent:

```typescript
// src/mastra/agents/my-agent.ts
import { Agent } from '@mastra/core/agent'
import { MockMemory } from '@mastra/core/memory'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

const model = createOpenAICompatible({
  baseURL: process.env.OPENAI_BASE_URL!,
  apiKey: process.env.OPENAI_API_KEY!,
  name: 'openai'
})

export const myAgent = new Agent({
  id: 'my-agent',
  name: 'myAgent',
  description: 'My helpful assistant',
  instructions: 'You are a helpful assistant.',
  model: model('gpt-4'),
  memory: new MockMemory({
    enableWorkingMemory: true,
    enableMessageHistory: true,
  }),
})
```

## Memory Options

### MockMemory (Recommended for CopilotKit)

`MockMemory` from `@mastra/core/memory` is designed for development and works well with CopilotKit:

```typescript
import { MockMemory } from '@mastra/core/memory'

memory: new MockMemory({
  enableWorkingMemory: true,      // Enable persistent working memory
  enableMessageHistory: true,     // Enable conversation history
  workingMemoryTemplate: `# User Context
- Name:
- Preferences:
- Notes:
`,
})
```

**Pros:**
- Built into `@mastra/core` (no extra install)
- In-memory storage (fast)
- Works with CopilotKit's automatic `resourceId`/`threadId` passing

**Cons:**
- Not persistent across server restarts
- Limited to single-server deployments

### Memory from @mastra/memory

For production with persistent storage, use `Memory` from `@mastra/memory`:

```bash
npm install @mastra/memory --legacy-peer-deps
```

```typescript
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'

const storage = new LibSQLStore({
  id: 'my-agent-memory',
  url: 'file:./memory.db',
})

memory: new Memory({
  storage,
  lastMessages: 20,
  semanticRecall: false,  // Requires vector store
  workingMemory: {
    enabled: true,
    scope: 'resource',  // 'thread' or 'resource'
    template: `# User Context...`,
  },
})
```

**Note:** There may be version incompatibilities between `@mastra/core` and `@mastra/memory`. Use `--legacy-peer-deps` if needed.

## Working Memory Templates

Working memory provides persistent context that the agent can update over time:

```typescript
memory: new MockMemory({
  workingMemoryTemplate: `# Form Building Context

## Current Project
- Project Goal:
- Form Status:
- Previous Changes:

## User Preferences
- Communication Style:
- Common Field Types:
`,
})
```

The agent can use tools to update this template, maintaining context across conversations.

## Configuration Options

### MockMemory Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storage` | `InMemoryStore` | `undefined` | Custom storage (uses in-memory if omitted) |
| `enableWorkingMemory` | `boolean` | `false` | Enable working memory feature |
| `enableMessageHistory` | `boolean` | `false` | Enable conversation history |
| `workingMemoryTemplate` | `string` | `undefined` | Template for working memory |

### Memory (@mastra/memory) Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storage` | `MastraStorage` | required | Storage backend |
| `lastMessages` | `number \| false` | `10` | Number of recent messages to include |
| `semanticRecall` | `boolean \| object` | `false` | Enable vector-based retrieval |
| `workingMemory` | `object` | `undefined` | Working memory configuration |

## Version Compatibility Issues

### Problem: Type Mismatch

When using `Memory` from `@mastra/memory` with newer `@mastra/core`:

```
Type 'Memory' is not assignable to type 'DynamicArgument<MastraMemory>'.
```

**Cause:** Version mismatch between `@mastra/core@1.0.0-beta.21` and `@mastra/memory@0.15.13`.

**Solutions:**
1. Use `MockMemory` from `@mastra/core` (recommended for CopilotKit)
2. Install with `--legacy-peer-deps` if you need persistent storage
3. Wait for compatible version releases

## Troubleshooting

### Warning: No memory is configured

```
[Agent:myAgent] - No memory is configured but resourceId and threadId were passed in args.
```

**Solution:** Add `memory: new MockMemory()` to your agent configuration.

### Type error: Abstract class

```
Cannot create an instance of an abstract class.
```

**Cause:** Trying to instantiate `MastraMemory` directly (it's abstract).

**Solution:** Use `MockMemory` from `@mastra/core/memory` or `Memory` from `@mastra/memory`.

### Memory not persisting

**Cause:** Using `MockMemory` which is in-memory only.

**Solutions:**
1. Accept in-memory behavior (fine for development)
2. Use `Memory` from `@mastra/memory` with persistent storage
3. Implement your own storage backend

## Complete Example

```typescript
// src/mastra/agents/form-builder.ts
import { Agent } from '@mastra/core/agent'
import { MockMemory } from '@mastra/core/memory'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

const llm = createOpenAICompatible({
  baseURL: process.env.OPENAI_COMPATIBLE_BASE_URL!,
  apiKey: process.env.OPENAI_COMPATIBLE_API_KEY!,
  name: 'openai-compatible'
})

export const formBuilderAgent = new Agent({
  id: 'form-builder',
  name: 'formBuilder',
  description: 'AI assistant for building forms',
  instructions: 'You are a helpful form building assistant.',
  model: llm(process.env.OPENAI_COMPATIBLE_MODEL_ID!),
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
```

## Related Documentation

- [Mastra Memory Docs](https://mastra.ai/docs/memory)
- [CopilotKit Integration](getting-started.md)
- [Troubleshooting](troubleshooting.md)
