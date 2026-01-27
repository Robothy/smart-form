import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  it('should render children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should forward ref', () => {
    const ref = { current: null }
    render(<Button ref={ref}>Test</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    screen.getByRole('button', { name: 'Click me' }).click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should pass through MUI variant prop', () => {
    render(<Button variant="contained">Test</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('MuiButton-contained')
  })

  it('should pass through MUI color prop', () => {
    render(<Button color="primary">Test</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('MuiButton-colorPrimary')
  })

  it('should pass through MUI size prop', () => {
    render(<Button size="large">Test</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('MuiButton-sizeLarge')
  })

  it('should have correct displayName', () => {
    expect(Button.displayName).toBe('Button')
  })
})
