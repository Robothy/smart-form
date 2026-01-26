'use client'

import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import type { FormFieldData } from '@/components/forms/fill/FormFieldRenderer'

export interface FillFormToolsConfig {
  form: {
    id: string
    title: string
    description?: string
    fields: FormFieldData[]
  } | null
  values: Record<string, string | string[]>
  onSetValue: (fieldId: string, value: string | string[]) => void
  onSetMultipleValues: (updates: Record<string, string | string[]>) => void
  onClearValue: (fieldId: string) => void
}

/**
 * Validate date string in YYYY-MM-DD format
 */
function isValidDateFormat(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false

  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDateString(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Hook that registers tools for filling out a form
 * Allows the assistant to help users fill in form fields
 */
export function useFillFormTools(config: FillFormToolsConfig) {
  const { form, values, onSetValue, onSetMultipleValues, onClearValue } = config

  // Share form context with the assistant
  useCopilotReadable({
    description: 'Current form being filled out, including all fields and their requirements',
    value: JSON.stringify(
      form
        ? {
            formId: form.id,
            title: form.title,
            description: form.description,
            fields: form.fields.map((f) => ({
              id: f.id,
              label: f.label,
              type: f.type,
              placeholder: f.placeholder,
              required: f.required,
              options: f.options?.map((o) => ({ label: o.label, value: o.value })),
              currentValue: values[f.id!] || null,
            })),
          }
        : { status: 'loading' },
    ),
  })

  // Tool to set a field value
  useCopilotAction({
    name: 'setFieldValue',
    description: 'Set the value for a specific form field. For radio/checkbox fields, use the option label, not the value.',
    parameters: [
      {
        name: 'fieldLabel',
        type: 'string',
        description: 'The exact label of the field to set (case-insensitive)',
        required: true,
      },
      {
        name: 'value',
        type: 'string',
        description: 'The value to set. For radio/checkbox, use the option LABEL (e.g., "Option 1"), not the value.',
        required: true,
      },
    ],
    handler: async ({ fieldLabel, value }) => {
      if (!form) {
        throw new Error('表单尚未加载，请稍后再试')
      }

      if (!fieldLabel || typeof fieldLabel !== 'string') {
        throw new Error('字段标签不能为空，请提供有效的字段名称')
      }

      if (value === null || value === undefined) {
        throw new Error('字段值不能为空')
      }

      const valueStr = String(value)

      // Find field by label (case-insensitive)
      const field = form.fields.find(
        (f) => f.label.toLowerCase().trim() === fieldLabel.toLowerCase().trim()
      )

      if (!field) {
        const availableFields = form.fields.map((f) => f.label).join(', ')
        throw new Error(
          `找不到字段 "${fieldLabel}"。可用字段: ${availableFields}。请确保使用正确的字段名称。`
        )
      }

      const fieldId = field.id!

      // Validate based on field type
      if (field.type === 'radio') {
        if (!field.options || field.options.length === 0) {
          throw new Error(`字段 "${field.label}" 没有可用的选项`)
        }

        // Find option by label (case-insensitive)
        const option = field.options.find(
          (o) => o.label.toLowerCase().trim() === valueStr.toLowerCase().trim()
        )

        if (!option) {
          const availableOptions = field.options.map((o) => o.label).join(', ')
          throw new Error(
            `选项 "${valueStr}" 对字段 "${field.label}" 无效。可用选项: ${availableOptions}。请使用选项的标签（不是值）。`
          )
        }

        // Set the option value
        onSetValue(fieldId, option.value)

        // Update DOM for radio input
        setTimeout(() => {
          const radio = document.querySelector(
            `input[name="${fieldId}"][value="${option.value}"]`
          ) as HTMLInputElement
          if (radio) {
            radio.checked = true
            radio.dispatchEvent(new Event('change', { bubbles: true }))
          }
        }, 0)

        return `已设置 ${field.label} 为: ${option.label}`
      }

      if (field.type === 'checkbox') {
        if (!field.options || field.options.length === 0) {
          throw new Error(`字段 "${field.label}" 没有可用的选项`)
        }

        // Parse multiple values (comma or semicolon separated)
        const selectedLabels = valueStr
          .split(/[;,]/)
          .map((v) => v.trim().toLowerCase())
          .filter((v) => v.length > 0)

        if (selectedLabels.length === 0) {
          throw new Error('请至少选择一个选项')
        }

        const selectedValues: string[] = []
        const notFound: string[] = []

        for (const label of selectedLabels) {
          const option = field.options!.find(
            (o) => o.label.toLowerCase().trim() === label
          )
          if (option) {
            selectedValues.push(option.value)
          } else {
            notFound.push(label)
          }
        }

        if (notFound.length > 0) {
          const availableOptions = field.options.map((o) => o.label).join(', ')
          throw new Error(
            `选项 "${notFound.join(', ')}" 对字段 "${field.label}" 无效。可用选项: ${availableOptions}。您可以使用逗号分隔多个选项。`
          )
        }

        onSetValue(fieldId, selectedValues)

        // Update DOM for checkbox inputs
        setTimeout(() => {
          field.options!.forEach((opt) => {
            const checkbox = document.querySelector(
              `input[name="${fieldId}"][value="${opt.value}"]`
            ) as HTMLInputElement
            if (checkbox) {
              checkbox.checked = selectedValues.includes(opt.value)
              checkbox.dispatchEvent(new Event('change', { bubbles: true }))
            }
          })
        }, 0)

        const selectedOptionLabels = field.options
          .filter((o) => selectedValues.includes(o.value))
          .map((o) => o.label)
          .join(', ')
        return `已设置 ${field.label} 为: ${selectedOptionLabels}`
      }

      if (field.type === 'date') {
        // Try to format the date
        const formattedDate = formatDateString(valueStr)

        if (!isValidDateFormat(formattedDate)) {
          throw new Error(
            `日期格式无效 "${valueStr}"。请使用 YYYY-MM-DD 格式，例如: 2024-01-15`
          )
        }

        // Create Date object at noon to avoid timezone issues
        const [year, month, day] = formattedDate.split('-').map(Number)
        const dateObj = new Date(year, month - 1, day, 12, 0, 0)

        // Pass Date object to the component (via type cast since the state type is string | string[])
        onSetValue(fieldId, dateObj as unknown as string)

        // Find and update the DatePicker input element
        setTimeout(() => {
          // The DatePicker input should have aria-labelledby pointing to the field label
          const inputs = document.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
          for (const input of inputs) {
            const ariaLabelledBy = input.getAttribute('aria-labelledby')
            if (ariaLabelledBy === `${fieldId}-label`) {
              // Found the DatePicker input!
              // Format as MM/DD/YYYY which is what MUI DatePicker expects
              const mm = String(month).padStart(2, '0')
              const dd = String(day).padStart(2, '0')
              const displayValue = `${mm}/${dd}/${year}`

              // Update the input value
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                'value'
              )?.set
              if (nativeInputValueSetter) {
                nativeInputValueSetter.call(input, displayValue)
              } else {
                input.value = displayValue
              }

              // Trigger events to notify React/MUI of the change
              input.dispatchEvent(new Event('input', { bubbles: true }))
              input.dispatchEvent(new Event('change', { bubbles: true }))
              input.dispatchEvent(new Event('blur', { bubbles: true }))
              break
            }
          }
        }, 100)

        return `已设置 ${field.label} 为: ${formattedDate}`
      }

      // For text and textarea fields
      if (valueStr.length > 10000) {
        throw new Error(`字段值太长（最大10000字符）。当前长度: ${valueStr.length}`)
      }

      onSetValue(fieldId, valueStr)

      // Update DOM for text/textarea inputs
      setTimeout(() => {
        const input = document.querySelector(`[name="${fieldId}"]`) as HTMLInputElement
        if (input) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
          )?.set
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(input, valueStr)
          } else {
            input.value = valueStr
          }
          input.dispatchEvent(new Event('input', { bubbles: true }))
          input.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }, 0)

      return `已设置 ${field.label} 为: ${valueStr}`
    },
  })

  // Tool to set multiple field values at once
  useCopilotAction({
    name: 'setMultipleFieldValues',
    description: 'Set values for multiple fields at once. Provide an array of fields with their labels and values.',
    parameters: [
      {
        name: 'fields',
        type: 'object[]',
        description: 'Array of fields to set, each with label and value',
        required: true,
      },
    ],
    handler: async ({ fields }) => {
      if (!form) {
        throw new Error('表单尚未加载，请稍后再试')
      }

      if (!Array.isArray(fields)) {
        throw new Error('参数格式错误：fields 必须是数组')
      }

      const updates: Record<string, string | string[]> = {}
      const results: string[] = []
      const errors: string[] = []

      for (const fieldData of fields) {
        try {
          if (!fieldData.label || !fieldData.value) {
            errors.push(`字段数据缺少 label 或 value`)
            continue
          }

          const field = form.fields.find(
            (f) => f.label.toLowerCase().trim() === fieldData.label.toLowerCase().trim()
          )

          if (!field) {
            errors.push(`找不到字段 "${fieldData.label}"`)
            continue
          }

          const fieldId = field.id!
          const valueStr = String(fieldData.value)

          // Handle different field types
          if (field.type === 'radio') {
            const option = field.options?.find(
              (o) => o.label.toLowerCase().trim() === valueStr.toLowerCase().trim()
            )
            if (option) {
              updates[fieldId] = option.value
              results.push(`${field.label}: ${option.label}`)
            } else {
              errors.push(`字段 "${field.label}" 的选项 "${valueStr}" 无效`)
            }
          } else if (field.type === 'checkbox') {
            const selectedLabels = valueStr.split(/[;,]/).map((v) => v.trim().toLowerCase())
            const selectedValues: string[] = []

            for (const label of selectedLabels) {
              const option = field.options?.find((o) => o.label.toLowerCase().trim() === label)
              if (option) selectedValues.push(option.value)
            }

            if (selectedValues.length > 0) {
              updates[fieldId] = selectedValues
              const selectedLabels = field.options!
                .filter((o) => selectedValues.includes(o.value))
                .map((o) => o.label)
                .join(', ')
              results.push(`${field.label}: ${selectedLabels}`)
            } else {
              errors.push(`字段 "${field.label}" 的选项 "${valueStr}" 无效`)
            }
          } else if (field.type === 'date') {
            const formattedDate = formatDateString(valueStr)
            if (isValidDateFormat(formattedDate)) {
              const [year, month, day] = formattedDate.split('-').map(Number)
              const dateObj = new Date(year, month - 1, day, 12, 0, 0)
              updates[fieldId] = dateObj as unknown as string
              results.push(`${field.label}: ${formattedDate}`)
            } else {
              errors.push(`字段 "${field.label}" 的日期格式无效: ${valueStr}`)
            }
          } else {
            updates[fieldId] = valueStr
            results.push(`${field.label}: ${valueStr}`)
          }
        } catch (err) {
          errors.push(`设置字段 "${fieldData.label}" 时出错: ${err instanceof Error ? err.message : '未知错误'}`)
        }
      }

      onSetMultipleValues(updates)

      // Update DOM
      setTimeout(() => {
        Object.entries(updates).forEach(([fieldId, value]) => {
          const field = form.fields.find((f) => f.id === fieldId)
          if (!field) return

          if (field.type === 'radio') {
            const radio = document.querySelector(
              `input[name="${fieldId}"][value="${value}"]`
            ) as HTMLInputElement
            if (radio) {
              radio.checked = true
              radio.dispatchEvent(new Event('change', { bubbles: true }))
            }
          } else if (field.type === 'checkbox' && Array.isArray(value)) {
            field.options?.forEach((opt) => {
              const checkbox = document.querySelector(
                `input[name="${fieldId}"][value="${opt.value}"]`
              ) as HTMLInputElement
              if (checkbox) {
                checkbox.checked = value.includes(opt.value)
                checkbox.dispatchEvent(new Event('change', { bubbles: true }))
              }
            })
          } else if (field.type === 'date') {
            // Handle DatePicker input
            const inputs = document.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
            for (const input of inputs) {
              const ariaLabelledBy = input.getAttribute('aria-labelledby')
              if (ariaLabelledBy === `${fieldId}-label`) {
                // value is a Date object cast as string
                const dateObj = value as unknown as Date
                const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
                const dd = String(dateObj.getDate()).padStart(2, '0')
                const year = dateObj.getFullYear()
                const displayValue = `${mm}/${dd}/${year}`

                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                  HTMLInputElement.prototype,
                  'value'
                )?.set
                if (nativeInputValueSetter) {
                  nativeInputValueSetter.call(input, displayValue)
                } else {
                  input.value = displayValue
                }
                input.dispatchEvent(new Event('input', { bubbles: true }))
                input.dispatchEvent(new Event('change', { bubbles: true }))
                input.dispatchEvent(new Event('blur', { bubbles: true }))
                break
              }
            }
          } else {
            const input = document.querySelector(`[name="${fieldId}"]`) as HTMLInputElement
            if (input) {
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                'value'
              )?.set
              if (nativeInputValueSetter) {
                nativeInputValueSetter.call(input, String(value))
              } else {
                input.value = String(value)
              }
              input.dispatchEvent(new Event('input', { bubbles: true }))
              input.dispatchEvent(new Event('change', { bubbles: true }))
            }
          }
        })
      }, 100)

      let response = ''
      if (results.length > 0) {
        response += `已成功设置以下字段:\n${results.join('\n')}`
      }
      if (errors.length > 0) {
        if (response) response += '\n\n'
        response += `以下字段设置失败:\n${errors.join('\n')}`
      }

      return response || '没有设置任何字段'
    },
  })

  // Tool to get current form values
  useCopilotAction({
    name: 'getCurrentValues',
    description: 'Get all currently filled form values',
    parameters: [],
    handler: async () => {
      if (!form) {
        throw new Error('表单尚未加载')
      }

      const filledFields: { label: string; value: string }[] = []

      for (const field of form.fields) {
        const value = values[field.id!]
        if (value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
          let displayValue: string

          if (Array.isArray(value)) {
            // For checkbox, convert values to labels
            const labels = field.options
              ?.filter((o) => value.includes(o.value))
              .map((o) => o.label)
            displayValue = labels?.join(', ') || value.join(', ')
          } else if (field.type === 'radio' && field.options) {
            const option = field.options.find((o) => o.value === value)
            displayValue = option?.label || value
          } else {
            displayValue = value
          }

          filledFields.push({
            label: field.label,
            value: displayValue,
          })
        }
      }

      return {
        totalFields: form.fields.length,
        filledCount: filledFields.length,
        fields: filledFields,
      }
    },
  })

  // Tool to clear a field value
  useCopilotAction({
    name: 'clearFieldValue',
    description: 'Clear the value of a specific field',
    parameters: [
      {
        name: 'fieldLabel',
        type: 'string',
        description: 'The exact label of the field to clear (case-insensitive)',
        required: true,
      },
    ],
    handler: async ({ fieldLabel }) => {
      if (!form) {
        throw new Error('表单尚未加载')
      }

      if (!fieldLabel || typeof fieldLabel !== 'string') {
        throw new Error('字段标签不能为空')
      }

      const field = form.fields.find(
        (f) => f.label.toLowerCase().trim() === fieldLabel.toLowerCase().trim()
      )

      if (!field) {
        const availableFields = form.fields.map((f) => f.label).join(', ')
        throw new Error(`找不到字段 "${fieldLabel}"。可用字段: ${availableFields}`)
      }

      const fieldId = field.id!
      onClearValue(fieldId)

      // Clear DOM element
      setTimeout(() => {
        if (field.type === 'radio') {
          const radios = document.querySelectorAll(`input[name="${fieldId}"]`) as NodeListOf<HTMLInputElement>
          radios.forEach((radio) => {
            radio.checked = false
            radio.dispatchEvent(new Event('change', { bubbles: true }))
          })
        } else if (field.type === 'checkbox') {
          const checkboxes = document.querySelectorAll(`input[name="${fieldId}"]`) as NodeListOf<HTMLInputElement>
          checkboxes.forEach((checkbox) => {
            checkbox.checked = false
            checkbox.dispatchEvent(new Event('change', { bubbles: true }))
          })
        } else {
          const input = document.querySelector(`[name="${fieldId}"]`) as HTMLInputElement
          if (input) {
            input.value = ''
            input.dispatchEvent(new Event('input', { bubbles: true }))
            input.dispatchEvent(new Event('change', { bubbles: true }))
          }
        }
      }, 0)

      return `已清除 ${field.label} 的值`
    },
  })

  // Tool to explain a specific field
  useCopilotAction({
    name: 'explainField',
    description: 'Explain what information should be provided for a specific form field',
    parameters: [
      {
        name: 'fieldLabel',
        type: 'string',
        description: 'The exact label of the field to explain (case-insensitive)',
        required: true,
      },
    ],
    handler: async ({ fieldLabel }) => {
      if (!form) {
        throw new Error('表单尚未加载')
      }

      if (!fieldLabel) {
        throw new Error('字段标签不能为空')
      }

      const field = form.fields.find(
        (f) => f.label.toLowerCase().trim() === fieldLabel.toLowerCase().trim()
      )

      if (!field) {
        const availableFields = form.fields.map((f) => f.label).join(', ')
        throw new Error(`找不到字段 "${fieldLabel}"。可用字段: ${availableFields}`)
      }

      let explanation = `**${field.label}** (${field.type})\n`

      if (field.required) {
        explanation += '- 状态: *必填*\n'
      } else {
        explanation += '- 状态: *选填*\n'
      }

      if (field.placeholder) {
        explanation += `- 提示: ${field.placeholder}\n`
      }

      if (field.type === 'radio') {
        explanation += `\n这是单选字段，请从以下选项中选择一个：\n`
        explanation += field.options?.map((o, i) => `${i + 1}. ${o.label}`).join('\n') || '无选项'
      } else if (field.type === 'checkbox') {
        explanation += `\n这是多选字段，可以选择多个选项：\n`
        explanation += field.options?.map((o, i) => `${i + 1}. ${o.label}`).join('\n') || '无选项'
        explanation += '\n\n您可以使用逗号分隔多个选项，例如: "选项1, 选项2"'
      } else if (field.type === 'textarea') {
        explanation += '\n这是一个多行文本字段，用于较长的回答。'
      } else if (field.type === 'date') {
        explanation += '\n请使用标准日期格式 (YYYY-MM-DD)，例如: 2024-01-15'
      } else if (field.type === 'text') {
        explanation += '\n这是单行文本字段。'
      }

      const currentValue = values[field.id!]
      if (currentValue) {
        let displayValue: string
        if (Array.isArray(currentValue)) {
          const labels = field.options?.filter((o) => currentValue.includes(o.value)).map((o) => o.label)
          displayValue = labels?.join(', ') || currentValue.join(', ')
        } else if (field.type === 'radio' && field.options) {
          const option = field.options.find((o) => o.value === currentValue)
          displayValue = option?.label || currentValue
        } else {
          displayValue = currentValue
        }
        explanation += `\n\n当前值: ${displayValue}`
      } else {
        explanation += '\n\n当前未填写'
      }

      return explanation
    },
  })

  // Tool to get form summary
  useCopilotAction({
    name: 'getFormSummary',
    description: 'Get a summary of the form including total fields, required fields, and fill status',
    parameters: [],
    handler: async () => {
      if (!form) {
        throw new Error('表单尚未加载')
      }

      const requiredFields = form.fields.filter((f) => f.required)
      const optionalFields = form.fields.filter((f) => !f.required)
      const filledFields = form.fields.filter((f) => {
        const value = values[f.id!]
        return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)
      })
      const unfilledRequiredFields = requiredFields.filter((f) => {
        const value = values[f.id!]
        return value === undefined || value === '' || (Array.isArray(value) && value.length === 0)
      })

      const fieldTypes = form.fields.reduce((acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const fieldsList = form.fields.map((f) => {
        const value = values[f.id!]
        const isFilled = value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)

        let displayValue = ''
        if (isFilled) {
          if (Array.isArray(value)) {
            const labels = f.options?.filter((o) => value.includes(o.value)).map((o) => o.label)
            displayValue = labels?.join(', ') || value.join(', ')
          } else if (f.type === 'radio' && f.options) {
            const option = f.options.find((o) => o.value === value)
            displayValue = option?.label || value
          } else {
            displayValue = String(value)
          }
        }

        return {
          label: f.label,
          type: f.type,
          required: f.required,
          filled: isFilled,
          currentValue: isFilled ? displayValue : null,
        }
      })

      return {
        title: form.title,
        description: form.description || null,
        totalFields: form.fields.length,
        requiredFields: requiredFields.length,
        optionalFields: optionalFields.length,
        filledFields: filledFields.length,
        remainingRequiredFields: unfilledRequiredFields.length,
        fieldTypes,
        fields: fieldsList,
      }
    },
  })
}
