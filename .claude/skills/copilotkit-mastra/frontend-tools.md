# Frontend Tools

Patterns for defining CopilotKit frontend tools with proper TypeScript types.

## Tool Definition Pattern

```typescript
import { useFrontendTool } from '@copilotkit/react-core'

useFrontendTool({
  name: 'toolName',
  description: 'What it does',
  parameters: [
    {
      name: 'param',
      type: 'string',
      description: '...',
      required: true,
    },
  ],
  handler: async (args) => {
    const { param } = args as { param: string }
    // Execute logic
    return 'Result message'
  },
})
```

## Supported Parameter Types

```typescript
// Primitives
type: 'string'
type: 'number'
type: 'boolean'

// Complex
type: 'object'      // With attributes
type: 'object[]'    // Array of objects

// Primitive arrays
type: 'string[]'
type: 'number[]'
type: 'boolean[]'
```

**⚠️ Critical:** Use `'object[]'` NOT `'array'`

## Type Safety Pattern

```typescript
// Define interface for parameters
interface UpdateFieldParams {
  fieldIndex: number
  updates: {
    label?: string
    required?: boolean
  }
}

useFrontendTool({
  name: 'updateField',
  parameters: [
    { name: 'fieldIndex', type: 'number', required: true },
    {
      name: 'updates',
      type: 'object',
      required: true,
      attributes: [
        { name: 'label', type: 'string' },
        { name: 'required', type: 'boolean' },
      ],
    },
  ],
  handler: async (args) => {
    const { fieldIndex, updates } = args as UpdateFieldParams
    // Full type safety
  },
})
```

## Tool Examples

### Simple String Parameter

```typescript
useFrontendTool({
  name: 'updateTitle',
  description: 'Update the title',
  parameters: [
    {
      name: 'title',
      type: 'string',
      description: 'New title',
      required: true,
    },
  ],
  handler: async (args) => {
    const { title } = args as { title: string }
    onUpdateTitle(title)
    return `Title updated`
  },
})
```

### Object Array Parameter

```typescript
useFrontendTool({
  name: 'setOptions',
  parameters: [
    {
      name: 'options',
      type: 'object[]',  // ⚠️ NOT 'array'
      required: true,
      attributes: [
        { name: 'label', type: 'string' },
        { name: 'value', type: 'string' },
      ],
    },
  ],
  handler: async (args) => {
    const { options } = args as {
      options: { label: string; value: string }[]
    }
    onUpdateOptions(options)
    return 'Options updated'
  },
})
```

### Multiple Parameters

```typescript
useFrontendTool({
  name: 'addField',
  description: 'Add a new field',
  parameters: [
    { name: 'type', type: 'string', required: true },
    { name: 'label', type: 'string', required: true },
    { name: 'placeholder', type: 'string', required: false },
    { name: 'required', type: 'boolean', required: false },
    {
      name: 'options',
      type: 'object[]',
      required: false,
      attributes: [
        { name: 'label', type: 'string' },
        { name: 'value', type: 'string' },
      ],
    },
  ],
  handler: async (args) => {
    const { type, label, placeholder, required, options } = args as {
      type: string
      label: string
      placeholder?: string
      required?: boolean
      options?: { label: string; value: string }[]
    }

    const newField = {
      type,
      label,
      placeholder,
      required: required ?? false,
      options,
    }

    onUpdateFields([...fields, newField])
    return `Added ${type} field: ${label}`
  },
})
```

### Read-Only Tool

```typescript
useFrontendTool({
  name: 'getSummary',
  description: 'Get current state',
  parameters: [],
  handler: async () => {
    return {
      title: form.title,
      fieldCount: form.fields.length,
      fields: form.fields.map(f => ({
        type: f.type,
        label: f.label,
      })),
    }
  },
})
```

## State Management Pattern

```typescript
interface ToolsConfig {
  currentValue: string
  items: Item[]
  onUpdate: (updates: Partial<State>) => void
}

export function useMyTools(config: ToolsConfig) {
  const { currentValue, items, onUpdate } = config

  // Read-only
  useFrontendTool({
    name: 'getCurrentState',
    parameters: [],
    handler: async () => ({ currentValue, itemCount: items.length }),
  })

  // Mutation
  useFrontendTool({
    name: 'setValue',
    parameters: [{ name: 'value', type: 'string', required: true }],
    handler: async (args) => {
      const { value } = args as { value: string }
      onUpdate({ currentValue: value })
      return `Value updated`
    },
  })

  // Batch mutation
  useFrontendTool({
    name: 'batchUpdate',
    parameters: [{ name: 'updates', type: 'object', required: true }],
    handler: async (args) => {
      const { updates } = args as { updates: Partial<State> }
      onUpdate(updates)
      return 'Updated'
    },
  })
}
```

## Error Handling

```typescript
useFrontendTool({
  name: 'removeItem',
  parameters: [{ name: 'index', type: 'number', required: true }],
  handler: async (args) => {
    const { index } = args as { index: number }

    // Validate
    if (index < 0 || index >= items.length) {
      throw new Error(`Invalid index: ${index}`)
    }

    // Execute
    const updated = items.filter((_, i) => i !== index)
    onUpdate({ items: updated })

    return `Removed item at ${index}`
  },
})
```

## Best Practices

1. **Always type-assert** handler parameters
2. **Use `'object[]'`** not `'array'`
3. **Validate inputs** before mutations
4. **Return descriptive messages** for feedback
5. **Group related tools** in a single hook
6. **Document parameters** clearly for the LLM
7. **Mark truly required params** as `required: true`
