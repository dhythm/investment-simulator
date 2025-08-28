import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toBe('text-red-500 bg-blue-500')
    })

    it('should override conflicting classes', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toBe('base-class active-class')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['text-sm', 'font-medium'], 'text-red-500')
      expect(result).toBe('text-sm font-medium text-red-500')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'end-class')
      expect(result).toBe('base-class end-class')
    })

    it('should merge padding classes correctly', () => {
      const result = cn('p-4', 'px-6')
      expect(result).toBe('p-4 px-6')
    })
  })
})