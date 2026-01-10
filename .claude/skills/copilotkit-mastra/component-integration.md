# Component Integration

Integrating CopilotPopup, CopilotSidebar, and state sharing with agents.

## UI Components

### CopilotPopup (Floating Chat)

```typescript
import { CopilotPopup } from '@copilotkit/react-ui'
import { useCopilotReadable } from '@copilotkit/react-core'
import { useFormTools } from './form-tools'

function MyAssistant({ form, onUpdate }: Props) {
  // Share state with agent
  useCopilotReadable({
    description: 'Current form state',
    value: JSON.stringify(form),
  })

  // Register tools
  useFormTools({
    formTitle: form.title,
    fields: form.fields,
    onUpdateForm: (updates) => {
      const updated = { ...form, ...updates }
      onUpdate(updated)
    },
  })

  return (
    <CopilotPopup
      instructions="You are a form building assistant..."
      labels={{
        title: 'Form Assistant',
        initial: 'Hi! How can I help with your form?',
      }}
      defaultOpen={false}
      shortcut="j"  // Cmd+J / Ctrl+J
    />
  )
}
```

### CopilotSidebar (Side Panel)

```typescript
import { CopilotSidebar } from '@copilotkit/react-ui'

<CopilotSidebar
  defaultOpen={true}
  instructions="You are helping build a form..."
  labels={{
    title: 'Assistant',
    initial: 'What would you like to create?',
  }}
>
  <YourMainContent />
</CopilotSidebar>
```

### CopilotChat (Flexible Placement)

```typescript
import { CopilotChat } from '@copilotkit/react-ui'

<CopilotChat
  instructions="Help with forms..."
  labels={{
    title: 'Form Helper',
    initial: 'Ask me anything about forms',
  }}
/>
```

## State Sharing

### useCopilotReadable - Share State with Agent

```typescript
import { useCopilotReadable } from '@copilotkit/react-core'

function MyComponent({ data }: Props) {
  // Agent can now access this data
  useCopilotReadable({
    description: 'Current application state including user data and form fields',
    value: JSON.stringify({
      user: { name: data.user.name, email: data.user.email },
      formFields: data.fields.map(f => ({
        type: f.type,
        label: f.label,
        required: f.required,
      })),
    }),
  })

  return <div>{/* ... */}</div>
}
```

**When to use:**
- Agent needs context about current state
- Multi-step operations requiring state awareness
- Agent should see latest data after tool calls

### Dynamic State Updates

```typescript
useCopilotReadable({
  description: 'Current form state',
  value: JSON.stringify({
    title: form.title,
    fields: form.fields,
    // Computed values
    fieldCount: form.fields.length,
    hasRequiredFields: form.fields.some(f => f.required),
  }),
})
```

## Tool Registration Pattern

### Centralized Tool Hook

```typescript
// lib/tools/form-tools.ts
export interface FormToolsConfig {
  formTitle: string
  fields: FormFieldData[]
  onUpdateForm: (updates: { title?: string; fields?: FormFieldData[] }) => void
}

export function useFormTools(config: FormToolsConfig) {
  const { formTitle, fields, onUpdateForm } = config

  useFrontendTool({
    name: 'updateTitle',
    parameters: [{ name: 'title', type: 'string', required: true }],
    handler: async (args) => {
      const { title } = args as { title: string }
      onUpdateForm({ title })
      return `Title updated`
    },
  })

  // ... more tools
}
```

### Component Integration

```typescript
// components/FormAssistant.tsx
function FormAssistant({ form, onUpdate }: Props) {
  // Share state
  useCopilotReadable({
    description: 'Form state',
    value: JSON.stringify(form),
  })

  // Register tools with callbacks
  useFormTools({
    formTitle: form.title,
    fields: form.fields,
    onUpdateForm: (updates) => {
      const updated = { ...form, ...updates }
      onUpdate(updated)
    },
  })

  return <CopilotPopup /* ... */ />
}
```

## Integration in Pages

### Edit Page Integration

```typescript
// app/forms/[id]/edit/page.tsx
import { FormAssistant } from '@/components/FormAssistant'

export default function EditFormPage({ params }: { params: { id: string } }) {
  const { form } = useFormLoader(params.id)
  const [editedForm, setEditedForm] = useState(form)

  return (
    <>
      <Container>
        <FormBuilder
          form={editedForm}
          onUpdate={setEditedForm}
        />
      </Container>

      {/* Assistant only for draft forms */}
      {form.status === 'draft' && (
        <FormAssistant
          form={editedForm}
          onUpdate={setEditedForm}
        />
      )}
    </>
  )
}
```

### Conditional Rendering

```typescript
{form && !isPublished && (
  <FormAssistant
    form={form}
    onUpdate={handleUpdate}
  />
)}
```

## CopilotKit Provider

### Root Layout (Global)

```typescript
// app/layout.tsx
import '@copilotkit/react-ui/styles.css'
import { CopilotKit } from '@copilotkit/react-core'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CopilotKit runtimeUrl="/api/copilotkit" agent="myAgent">
          {children}
        </CopilotKit>
      </body>
    </html>
  )
}
```

### Page-Level Override

```typescript
// app/special/page.tsx
<CopilotKit runtimeUrl="/api/copilotkit" agent="specialAgent">
  <SpecialComponent />
</CopilotKit>
```

## Instructions Context

### Dynamic Instructions

```typescript
<CopilotPopup
  instructions={`
You are a form building assistant.

Current form: ${form.title || 'Untitled'}
Field count: ${form.fields.length}

Available actions:
- Add fields (text, textarea, date, radio, checkbox)
- Update existing fields
- Remove fields
  `.trim()}
/>
```

### Context-Aware Instructions

```typescript
<CopilotPopup
  instructions={
    isReadOnly
      ? 'This form is read-only. You can only view and explain the form structure.'
      : 'Help the user build and modify their form. You can add, update, or remove fields.'
  }
/>
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+J` / `Ctrl+J` | Toggle popup (default) |
| Custom shortcut | `shortcut="k"` prop |

```typescript
<CopilotPopup
  shortcut="k"  // Cmd+K / Ctrl+K
  // ...
/>
```
