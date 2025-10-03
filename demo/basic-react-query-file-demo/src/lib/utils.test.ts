import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-2 py-1', 'text-sm')
    expect(result).toBe('px-2 py-1 text-sm')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isHidden = false
    const result = cn(
      'base-class',
      isActive && 'conditional-class',
      isHidden && 'hidden-class'
    )
    expect(result).toBe('base-class conditional-class')
  })

  it('should handle Tailwind conflicts', () => {
    const result = cn('px-2 px-4', 'py-1 py-2')
    expect(result).toBe('px-4 py-2')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'end')
    expect(result).toBe('base end')
  })
})
