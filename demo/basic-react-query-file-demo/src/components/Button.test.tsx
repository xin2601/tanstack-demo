import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button Component', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass(
      'bg-blue-600',
      'text-white',
      'h-10',
      'px-4',
      'py-2'
    )
  })

  it('should render different variants', () => {
    const { rerender } = render(<Button variant='primary'>Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600', 'text-white')

    rerender(<Button variant='secondary'>Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass(
      'bg-gray-200',
      'text-gray-900'
    )

    rerender(<Button variant='outline'>Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass(
      'border',
      'border-gray-300',
      'bg-transparent'
    )
  })

  it('should render different sizes', () => {
    const { rerender } = render(<Button size='sm'>Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8', 'px-3', 'text-sm')

    rerender(<Button size='md'>Medium</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10', 'px-4', 'py-2')

    rerender(<Button size='lg'>Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-12', 'px-6', 'text-lg')
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)

    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass(
      'disabled:opacity-50',
      'disabled:pointer-events-none'
    )
  })

  it('should accept custom className', () => {
    render(<Button className='custom-class'>Custom</Button>)

    const button = screen.getByRole('button', { name: 'Custom' })
    expect(button).toHaveClass('custom-class')
  })

  it('should forward other props to button element', () => {
    render(
      <Button data-testid='custom-button' type='submit'>
        Submit
      </Button>
    )

    const button = screen.getByTestId('custom-button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})
