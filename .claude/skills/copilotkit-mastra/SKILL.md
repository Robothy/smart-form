---
name: copilotkit-mastra
description: Integrate CopilotKit frontend tools with Mastra agents for AI assistants that can directly manipulate React state. Use when setting up popup/sidebar chat interfaces with browser-executable tools for forms, content editors, or interactive UIs.
allowed-tools: Read, Write, Edit, Bash(npm:*)
---

# CopilotKit + Mastra Integration

Quick reference for AI assistants with browser-executable tools.

## Quick Reference

| Concept | Key Point |
|---------|-----------|
| **Agent ID** | `agent="myAgent"` in CopilotKit must match Mastra registration key |
| **resourceId** | Required param in `MastraAgent.getLocalAgents({ resourceId })` |
| **Array types** | Use `'object[]'` NOT `'array'` in parameter definitions |
| **State sharing** | Use `useCopilotReadable` to share React state with agent |
| **Type safety** | Always assert handler params: `args as { param: string }` |
| **Memory config** | Add `MockMemory` or `Memory` to agent for conversation context |

## Common Errors (Quick Fixes)

| Error | Fix |
|-------|-----|
| `Agent 'default' not found` | Add `agent="myAgent"` to CopilotKit provider |
| `Property 'resourceId' is missing` | Add `resourceId: 'any-string'` to getLocalAgents |
| `Type '"array"' is not assignable` | Use `type: 'object[]'` not `'array'` |
| `Module has no exported member 'Parameter'` | Remove Parameter import |
| Tools not working | Component must be inside CopilotKit |
| Unstyled popup | Import `@copilotkit/react-ui/styles.css` |
| `No memory is configured but resourceId/threadId were passed` | Add `memory: new MockMemory()` to agent |

## Progressive Resources

Setup and detailed documentation:

- **[getting-started.md](getting-started.md)** - Installation, runtime endpoint, provider setup, agent registration
- **[runtime-configuration.md](runtime-configuration.md)** - Advanced runtime setup, multiple agents, service adapters
- **[frontend-tools.md](frontend-tools.md)** - Tool definition patterns, type safety, parameter types
- **[component-integration.md](component-integration.md)** - CopilotPopup/Sidebar setup, useCopilotReadable
- **[memory.md](memory.md)** - Agent memory configuration, conversation persistence, MockMemory vs Memory
- **[troubleshooting.md](troubleshooting.md)** - Complete error reference, debugging tips
- **[complete-example.md](complete-example.md)** - Full working form builder example
