import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FieldGroup } from '@/components/ui/FieldGroup'

describe('FieldGroup Component', () => {
  it('should render label', () => {
    render(
      <FieldGroup label="Personal Information">
        <input type="text" />
      </FieldGroup>
    )

    expect(screen.getByText('Personal Information')).toBeInTheDocument()
  })

  it('should render required indicator when required is true', () => {
    render(
      <FieldGroup label="Email" required>
        <input type="email" />
      </FieldGroup>
    )

    const label = screen.getByText('Email')
    expect(label).toHaveClass('Mui-required')
  })

  it('should not render required indicator when required is false', () => {
    render(
      <FieldGroup label="Email" required={false}>
        <input type="email" />
      </FieldGroup>
    )

    const label = screen.getByText('Email')
    expect(label).not.toHaveClass('Mui-required')
  })

  it('should render error message', () => {
    render(
      <FieldGroup label="Email" error="Invalid email format">
        <input type="email" />
      </FieldGroup>
    )

    expect(screen.getByText('Invalid email format')).toBeInTheDocument()
  })

  it('should render children', () => {
    render(
      <FieldGroup label="Email">
        <input type="email" data-testid="email-input" />
      </FieldGroup>
    )

    expect(screen.getByTestId('email-input')).toBeInTheDocument()
  })

  it('should apply custom sx prop', () => {
    const { container } = render(
      <FieldGroup label="Test" sx={{ mt: 5 }}>
        <div>Child</div>
      </FieldGroup>
    )

    const formControl = container.querySelector('.MuiFormControl-root')
    expect(formControl).toBeInTheDocument()
    // Check if custom sx was applied (checking for margin-top in computed style)
    expect(getComputedStyle(formControl!).marginTop).toBe('40px')
  })

  it('should render without label', () => {
    render(
      <FieldGroup>
        <input type="text" data-testid="test-input" />
      </FieldGroup>
    )

    // Should not crash, children should still render
    expect(screen.getByTestId('test-input')).toBeInTheDocument()
  })
})
