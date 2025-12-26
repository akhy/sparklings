import { describe, it, expect } from 'vitest'
import { diff } from './unidiff'

describe('diff', () => {
  it('should return empty string for identical objects', () => {
    const left = { name: 'John', age: 30 }
    const right = { name: 'John', age: 30 }
    const result = diff(left, right)
    expect(result).toBe('')
  })

  it('should detect added properties', () => {
    const left = { name: 'John' }
    const right = { name: 'John', age: 30 }
    const result = diff(left, right, { contextLines: 0 })
    expect(result).toMatch(/^\+[^\n]*age[^\n]*30/m) // Added line: contains 'age' and '30'
  })

  it('should detect removed properties', () => {
    const left = { name: 'John', age: 30 }
    const right = { name: 'John' }
    const result = diff(left, right, { contextLines: 0 })
    expect(result).toMatch(/^-[^\n]*age/m) // Removed line: contains 'age'
  })

  it('should detect changed values', () => {
    const left = { name: 'John', age: 30 }
    const right = { name: 'John', age: 31 }
    const result = diff(left, right, { contextLines: 0 })
    expect(result).toMatch(/^-[^\n]*30/m) // Removed line: contains '30'
    expect(result).toMatch(/^\+[^\n]*31/m) // Added line: contains '31'
  })

  it('should handle nested objects', () => {
    const left = { user: { name: 'John', email: 'john@example.com' } }
    const right = { user: { name: 'John', email: 'john.doe@example.com' } }
    const result = diff(left, right, { contextLines: 0 })
    expect(result).toMatch(/^-[^\n]*john@example\.com/m) // Removed line: contains old email
    expect(result).toMatch(/^\+[^\n]*john\.doe@example\.com/m) // Added line: contains new email
  })

  it('should handle arrays', () => {
    const left = { tags: ['a', 'b', 'c'] }
    const right = { tags: ['a', 'b', 'd'] }
    const result = diff(left, right, { contextLines: 0 })
    expect(result).toMatch(/^-[^\n]*"c"/m) // Removed line: contains "c"
    expect(result).toMatch(/^\+[^\n]*"d"/m) // Added line: contains "d"
  })

  it('should handle array additions', () => {
    const left = { tags: ['a', 'b'] }
    const right = { tags: ['a', 'b', 'c'] }
    const result = diff(left, right, { contextLines: 0 })
    expect(result).toMatch(/^\+[^\n]*"c"/m) // Added line: contains "c"
  })

  it('should handle array removals', () => {
    const left = { tags: ['a', 'b', 'c'] }
    const right = { tags: ['a', 'b'] }
    const result = diff(left, right, { contextLines: 0 })
    expect(result).toMatch(/^-[^\n]*"c"/m) // Removed line: contains "c"
  })

  it('should support YAML format', () => {
    const left = { name: 'John' }
    const right = { name: 'Jane' }
    const result = diff(left, right, { format: 'yaml', contextLines: 0 })
    expect(result).toMatch(/^-[^\n]*John/m) // Removed line: contains 'John'
    expect(result).toMatch(/^\+[^\n]*Jane/m) // Added line: contains 'Jane'
  })

  it('should use JSON format by default', () => {
    const left = { name: 'John' }
    const right = { name: 'Jane' }
    const result = diff(left, right, { contextLines: 0 })
    expect(result).toMatch(/^-[^\n]*John/m) // Removed line: contains 'John'
    expect(result).toMatch(/^\+[^\n]*Jane/m) // Added line: contains 'Jane'
  })

  it('should generate unified diff format', () => {
    const left = { name: 'John', age: 30 }
    const right = { name: 'Jane', age: 30 }
    const result = diff(left, right, { contextLines: 0 })
    expect(result).toContain('@@') // Contains chunk header
    expect(result).toMatch(/^-[^\n]*John/m) // Removed line: contains 'John'
    expect(result).toMatch(/^\+[^\n]*Jane/m) // Added line: contains 'Jane'
  })
})
