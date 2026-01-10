# Complete Example

Full working example of a form builder with CopilotKit + Mastra integration.

## Project Structure

```
workspace/
├── app/
│   ├── layout.tsx                    # CopilotKit provider
│   ├── api/
│   │   └── copilotkit/
│   │       └── route.ts              # Runtime endpoint
│   └── forms/
│       └── [id]/
│           └── edit/
│               └── page.tsx          # Edit page with assistant
├── components/
│   └── forms/
│       └── edit/
│           └── FormAssistant.tsx     # CopilotPopup + tools
├── lib/
│   └── copilotkit/
│       └── form-tools.ts             # Frontend tools
└── src/
    └── mastra/
        ├── index.ts                  # Mastra instance
        └── agents/
            └── form-builder.ts       # Agent definition
```

## Agent Definition

**File:** `src/mastra/agents/form-builder.ts`

```typescript
import { Agent } from '@mastra/core/agent'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

const zhipuAI = createOpenAICompatible({
  baseURL: process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: process.env.ZHIPU_API_KEY || '',
  name: 'zhipu'
})

export const formBuilderAgent = new Agent({
  id: 'form-builder',
  name: 'form-builder',
  description: 'AI assistant for building forms',
  instructions: `
You are a helpful form building assistant.

Available field types:
- text: Single-line text input (names, emails)
- textarea: Multi-line text input (comments)
- date: Date picker
- radio: Single selection (ratings)
- checkbox: Multiple selections

Best practices:
- Keep labels short and descriptive
- Mark only essential fields as required
- Suggest appropriate field types
  `.trim(),
  model: zhipuAI('glm-4.7'),
})
```

## Mastra Registration

**File:** `src/mastra/index.ts`

```typescript
import { Mastra } from '@mastra/core/mastra'
import { formBuilderAgent } from './agents/form-builder'

export const mastra = new Mastra({
  agents: {
    formBuilder: formBuilderAgent,
  },
})
```

## Runtime Endpoint

**File:** `app/api/copilotkit/route.ts`

```typescript
import { mastra } from '@/src/mastra'
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime'
import { MastraAgent } from '@ag-ui/mastra'
import { NextRequest } from 'next/server'

export const POST = async (req: NextRequest) => {
  const mastraAgents = MastraAgent.getLocalAgents({
    mastra,
    resourceId: 'form-builder',
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

## Root Provider

**File:** `app/layout.tsx`

```typescript
import '@copilotkit/react-ui/styles.css'
import { CopilotKit } from '@copilotkit/react-core'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CopilotKit runtimeUrl="/api/copilotkit" agent="formBuilder">
          {children}
        </CopilotKit>
      </body>
    </html>
  )
}
```

## Frontend Tools

**File:** `lib/copilotkit/form-tools.ts`

```typescript
'use client'

import { useFrontendTool } from '@copilotkit/react-core'
import type { FormFieldData, FormFieldType } from '@/components/forms/edit/fieldEditors'

export interface FormToolsConfig {
  formTitle: string
  fields: FormFieldData[]
  onUpdateForm: (updates: { title?: string; fields?: FormFieldData[] }) => void
}

export function useFormTools(config: FormToolsConfig) {
  const { formTitle, fields, onUpdateForm } = config

  useFrontendTool({
    name: 'updateFormTitle',
    description: 'Update the form title',
    parameters: [
      { name: 'title', type: 'string', required: true },
    ],
    handler: async (args) => {
      const { title } = args as { title: string }
      onUpdateForm({ title })
      return `Title updated to: ${title}`
    },
  })

  useFrontendTool({
    name: 'addField',
    description: 'Add a new field to the form',
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

      const newField: FormFieldData = {
        type: type as FormFieldType,
        label,
        placeholder,
        required: required ?? false,
        options,
        order: fields.length,
      }

      onUpdateForm({ fields: [...fields, newField] })
      return `Added ${type} field: ${label}`
    },
  })

  useFrontendTool({
    name: 'removeField',
    parameters: [
      { name: 'fieldIndex', type: 'number', required: true },
    ],
    handler: async (args) => {
      const { fieldIndex } = args as { fieldIndex: number }

      if (fieldIndex < 0 || fieldIndex >= fields.length) {
        throw new Error(`Invalid index: ${fieldIndex}`)
      }

      const updated = fields.filter((_, i) => i !== fieldIndex)
      onUpdateForm({ fields: updated })
      return `Removed field at ${fieldIndex}`
    },
  })
}
```

## Assistant Component

**File:** `components/forms/edit/FormAssistant.tsx`

```typescript
'use client'

import { CopilotPopup } from '@copilotkit/react-ui'
import { useCopilotReadable } from '@copilotkit/react-core'
import { useFormTools } from '@/lib/copilotkit/form-tools'
import type { FormData } from '@/components/ui/FormBuilder'

interface FormAssistantProps {
  form: FormData
  onUpdate: (form: FormData) => void
}

export function FormAssistant({ form, onUpdate }: FormAssistantProps) {
  useCopilotReadable({
    description: 'Current form state',
    value: JSON.stringify({
      title: form.title,
      fields: form.fields.map((f) => ({
        type: f.type,
        label: f.label,
        required: f.required,
      })),
    }),
  })

  useFormTools({
    formTitle: form.title,
    fields: form.fields,
    onUpdateForm: (updates) => {
      const updated: FormData = { ...form, ...updates }
      onUpdate(updated)
    },
  })

  return (
    <CopilotPopup
      instructions={`
You are a form building assistant.
Current form: ${form.title || 'Untitled'}
Available: Add/Update/Remove fields (text, textarea, date, radio, checkbox)
      `.trim()}
      labels={{
        title: 'Form Assistant',
        initial: 'Hi! I can help build your form.',
      }}
      defaultOpen={false}
      shortcut="j"
    />
  )
}
```

## Page Integration

**File:** `app/forms/[id]/edit/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Container } from '@mui/material'
import { FormBuilder, type FormData } from '@/components/ui/FormBuilder'
import { FormAssistant } from '@/components/forms/edit/FormAssistant'
import { useFormLoader } from '@/lib/hooks/use-form-loader'

export default function EditFormPage({ params }: { params: { id: string } }) {
  const { form, isLoading } = useFormLoader(params.id)
  const [editedForm, setEditedForm] = useState<FormData | null>(null)

  if (isLoading || !form || !editedForm) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <FormBuilder
          form={editedForm}
          onUpdate={setEditedForm}
          onSave={handleSave}
          showSaveButton={false}
        />
      </Container>

      {/* Assistant only for draft forms */}
      {form.status === 'draft' && (
        <FormAssistant form={editedForm} onUpdate={setEditedForm} />
      )}
    </>
  )
}
```

## Dependencies

**File:** `package.json`

```json
{
  "dependencies": {
    "@copilotkit/react-core": "^1.50.1",
    "@copilotkit/react-ui": "^1.50.1",
    "@copilotkit/runtime": "^1.50.1",
    "@ag-ui/mastra": "^0.2.0",
    "@mastra/core": "^1.0.0-beta.20",
    "@ai-sdk/openai-compatible": "^2.0.4"
  }
}
```

## Environment Variables

**File:** `.env.local`

```bash
ZHIPU_BASE_URL=https://open.bigmodel.cn/api/paas/v4
ZHIPU_API_KEY=your_api_key_here
```

## Usage Flow

1. User opens edit page
2. Presses `Cmd+J` to open assistant
3. Types: "Add an email field"
4. Agent calls `addField({ type: 'text', label: 'Email' })`
5. Tool executes → Updates React state
6. Form re-renders with new field
7. User reviews, clicks "Save" to persist

## Key Takeaways

1. **Agent ID must match** - `agent="formBuilder"` in provider must match Mastra key
2. **Resource ID required** - Always include in `MastraAgent.getLocalAgents()`
3. **Tools update local state** - Use callback, don't auto-save
4. **Share state with agent** - Use `useCopilotReadable` for awareness
5. **Type safety matters** - Always assert parameter types in handlers
6. **Use 'object[]' not 'array'** - Correct parameter type for arrays
