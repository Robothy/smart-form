# Troubleshooting

Common errors and solutions for CopilotKit + Mastra integration.

## Quick Reference Table

| Error | Quick Fix |
|-------|-----------|
| `Agent 'default' not found` | Add `agent="myAgent"` to CopilotKit |
| `Property 'resourceId' is missing` | Add `resourceId: "any-string"` |
| `Type '"array"' is not assignable` | Use `type: 'object[]'` |
| `Module has no exported member 'Parameter'` | Remove Parameter import |
| Tools not working | Component inside CopilotKit |
| Unstyled popup | Import `@copilotkit/react-ui/styles.css` |
| Wrong agent ID | Check `Known agents: [...]` in error |
| `No memory is configured but resourceId/threadId were passed` | Add `memory: new MockMemory()` to agent |

## Runtime Errors

### Agent 'default' not found

```
useAgent: Agent 'default' not found after runtime sync.
Known agents: [formBuilder]
```

**Cause:** Missing `agent` prop in CopilotKit provider.

**Solution:**
```typescript
// app/layout.tsx
<CopilotKit
  runtimeUrl="/api/copilotkit"
  agent="formBuilder"  // ← Add this (use name from error)
>
  {children}
</CopilotKit>
```

### Property 'resourceId' is missing

```
error TS2345: Argument of type '{ mastra: Mastra }' is not assignable.
Property 'resourceId' is missing.
```

**Cause:** `MastraAgent.getLocalAgents()` requires `resourceId` parameter.

**Solution:**
```typescript
// app/api/copilotkit/route.ts
const mastraAgents = MastraAgent.getLocalAgents({
  mastra,
  resourceId: 'any-string',  // ← Add this
})
```

### Type '"array"' is not assignable

```
error TS2322: Type '"array"' is not assignable to Parameter type.
```

**Cause:** Using `'array'` instead of `'object[]'`.

**Solution:**
```typescript
// ❌ WRONG
parameters: [{
  name: 'options',
  type: 'array',
}]

// ✅ CORRECT
parameters: [{
  name: 'options',
  type: 'object[]',  // ← Use object[]
  attributes: [
    { name: 'label', type: 'string' },
    { name: 'value', type: 'string' },
  ],
}]
```

## Type Errors

### Module has no exported member 'Parameter'

```
error TS2305: Module '"@copilotkit/react-core"' has no exported member 'Parameter'.
```

**Cause:** `Parameter` is from `@copilotkit/shared`, not `react-core`.

**Solution:**
```typescript
// ❌ WRONG
import { useFrontendTool, type Parameter } from '@copilotkit/react-core'

// ✅ CORRECT
import { useFrontendTool } from '@copilotkit/react-core'
```

### Type assignment failures

```
Type 'string' is not assignable to type 'FormFieldType'
```

**Cause:** Need type assertion when assigning string to enum/union type.

**Solution:**
```typescript
const newField: FormFieldData = {
  type: type as FormFieldType,  // ← Add type assertion
  label,
  // ...
}
```

## Runtime Issues

### Tools not appearing in agent

**Symptoms:** Agent doesn't call tools you defined.

**Check 1:** Component inside CopilotKit
```typescript
// ✅ Make sure component is inside CopilotKit
<CopilotKit runtimeUrl="/api/copilotkit">
  <FormAssistant />  // ← Must be inside
</CopilotKit>
```

**Check 2:** useFrontendTool called
```typescript
// ✅ Hook must be called (not conditionally)
export function FormAssistant() {
  useFormTools()  // ← Must be called
  return <CopilotPopup />
}
```

**Check 3:** Component rendered
```typescript
{form && <FormAssistant form={form} />}  // ← Renders when form exists
```

### Agent not receiving state changes

**Symptoms:** Agent doesn't see updated state after tool calls.

**Solution:** Use `useCopilotReadable`
```typescript
export function FormAssistant({ form }: Props) {
  // ✅ Share state with agent
  useCopilotReadable({
    description: 'Current form state',
    value: JSON.stringify(form),
  })

  return <CopilotPopup />
}
```

### Agent gives wrong field types

**Symptoms:** Agent creates invalid types like `'input'` instead of `'text'`.

**Solution:** Add explicit type instructions
```typescript
// src/mastra/agents/form-builder.ts
instructions: `
Available field types:
- text: Single-line text input
- textarea: Multi-line text input
- date: Date picker
- radio: Single selection
- checkbox: Multiple selections

Only use these exact type names.
`.trim()
```

### Agent creates tools with wrong parameters

**Solution:** Clear parameter descriptions
```typescript
useFrontendTool({
  name: 'addField',
  parameters: [
    {
      name: 'type',
      type: 'string',
      description: 'MUST be one of: text, textarea, date, radio, checkbox',
      required: true,
    },
  ],
})
```

## Build/Install Issues

### Peer dependency conflicts

```
npm ERR! peer @mastra/core@">=0.20.1" from @ag-ui/mastra@0.2.0
```

**Solution:**
```bash
npm install @copilotkit/react-core @copilotkit/react-ui --legacy-peer-deps
```

### CopilotKit CSS not loading

**Symptoms:** Popup/sidebar appears unstyled.

**Solution:**
```typescript
// app/layout.tsx - Import at top level
import '@copilotkit/react-ui/styles.css'
```

## Debugging Tips

### 1. Check available agents

```bash
curl http://localhost:3000/api/copilotkit/info
# Response: { "agents": ["formBuilder"] }
```

### 2. Enable dev console

```typescript
<CopilotKit
  runtimeUrl="/api/copilotkit"
  agent="formBuilder"
  showDevConsole={true}  // ← Shows error banners
>
```

### 3. Log tool calls

```typescript
useFrontendTool({
  name: 'myTool',
  handler: async (args) => {
    console.log('Tool called:', args)
    // ...
  },
})
```

### 4. Check network requests

Browser DevTools → Network → Filter by `/api/copilotkit`

## Common Mistakes

### Wrong: Using 'array' type

```typescript
// ❌ WRONG
type: 'array'
```

### Correct: Using 'object[]' type

```typescript
// ✅ CORRECT
type: 'object[]'
```

### Wrong: No type assertion

```typescript
// ❌ WRONG - args is unknown
handler: async (args) => {
  const { title } = args  // Type error!
}
```

### Correct: Always use type assertion

```typescript
// ✅ CORRECT
handler: async (args) => {
  const { title } = args as { title: string }
}
```

### Wrong: Forgetting agent prop

```typescript
// ❌ WRONG
<CopilotKit runtimeUrl="/api/copilotkit">
```

### Correct: Always specify agent

```typescript
// ✅ CORRECT
<CopilotKit runtimeUrl="/api/copilotkit" agent="myAgent">
```

## Verification Checklist

- [ ] `agent` prop matches registered agent key
- [ ] `resourceId` provided to `getLocalAgents`
- [ ] Using `'object[]'` not `'array'`
- [ ] CSS imported in root layout
- [ ] Component with tools inside CopilotKit
- [ ] `useCopilotReadable` for state sharing
- [ ] Type assertions in all handlers
- [ ] `/api/copilotkit/info` returns expected agents
- [ ] Agent has `memory` configured for conversation context
