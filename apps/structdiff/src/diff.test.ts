import { describe, it, expect } from 'vitest'
import { diff } from './diff'

describe('diff', () => {
  it('should return no differences for identical objects', () => {
    const left = { name: 'John', age: 30 }
    const right = { name: 'John', age: 30 }
    const result = diff(left, right)
    expect(result).toBe('No differences found.')
  })

  it('should detect added properties', () => {
    const left = { name: 'John' }
    const right = { name: 'John', age: 30 }
    const result = diff(left, right)
    expect(result).toContain('age')
    expect(result).toContain('30')
  })

  it('should detect removed properties', () => {
    const left = { name: 'John', age: 30 }
    const right = { name: 'John' }
    const result = diff(left, right)
    expect(result).toContain('age')
  })

  it('should detect changed values', () => {
    const left = { name: 'John', age: 30 }
    const right = { name: 'John', age: 31 }
    const result = diff(left, right)
    expect(result).toContain('age')
    expect(result).toContain('30')
    expect(result).toContain('31')
  })

  it('should handle nested objects', () => {
    const left = { user: { name: 'John', email: 'john@example.com' } }
    const right = { user: { name: 'John', email: 'john.doe@example.com' } }
    const result = diff(left, right)
    expect(result).toContain('email')
    expect(result).toContain('john@example.com')
    expect(result).toContain('john.doe@example.com')
  })

  it('should handle arrays', () => {
    const left = { tags: ['a', 'b', 'c'] }
    const right = { tags: ['a', 'b', 'd'] }
    const result = diff(left, right)
    expect(result).toContain('tags')
  })

  it('should handle array additions', () => {
    const left = { tags: ['a', 'b'] }
    const right = { tags: ['a', 'b', 'c'] }
    const result = diff(left, right)
    expect(result).toContain('tags')
  })

  it('should handle array removals', () => {
    const left = { tags: ['a', 'b', 'c'] }
    const right = { tags: ['a', 'b'] }
    const result = diff(left, right)
    expect(result).toContain('tags')
  })

  it('should throw error for unsupported formats', () => {
    const left = { name: 'John' }
    const right = { name: 'Jane' }
    expect(() => diff(left, right, { format: 'yaml' })).toThrow(
      'YAML diff format not yet implemented'
    )
  })

  it('should use JSON format by default', () => {
    const left = { name: 'John' }
    const right = { name: 'Jane' }
    const result = diff(left, right)
    expect(typeof result).toBe('string')
    expect(result).toContain('name')
  })
})
