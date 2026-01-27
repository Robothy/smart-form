import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormInput } from '@/components/ui/FormInput'

describe('FormInput Component', () => {
  it('should render text input with label', () => {
    render(<FormInput label="Name" />)

    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
  })

  it('should render with placeholder', () => {
    render(<FormInput label="Email" placeholder="Enter email" />)

    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveAttribute('placeholder', 'Enter email')
  })

  it('should display helper text', () => {
    render(<FormInput label="Name" helperText="Enter your full name" />)

    expect(screen.getByText('Enter your full name')).toBeInTheDocument()
  })

  it('should display error message', () => {
    render(<FormInput label="Name" error="This field is required" />)

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('should show error state', () => {
    render(<FormInput label="Name" error="Required" />)

    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('should call onChange when input changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<FormInput label="Name" onChange={handleChange} />)

    const input = screen.getByRole('textbox', { name: 'Name' })
    await user.type(input, 'John Doe')

    expect(handleChange).toHaveBeenCalled()
  })

  it('should be fullWidth by default', () => {
    const { container } = render(<FormInput label="Name" />)

    const textField = container.querySelector('.MuiFormControl-root')
    expect(textField).toHaveClass('MuiFormControl-fullWidth')
  })

  it('should have correct accessibility attributes', () => {
    render(<FormInput label="Email" placeholder="email@example.com" id="email" />)

    // aria-label is set on the wrapper, not the input
    const formControl = screen.getByRole('textbox', { name: 'Email' }).closest('.MuiFormControl-root')
    expect(formControl).toHaveAttribute('aria-label', 'email@example.com')
  })

  it('should have correct displayName', () => {
    expect(FormInput.displayName).toBe('FormInput')
  })
})
