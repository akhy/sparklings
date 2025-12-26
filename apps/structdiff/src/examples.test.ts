import { describe, it, expect } from 'vitest'
import { examples, getExample } from './examples'

describe('examples', () => {
  it('should have at least one example', () => {
    expect(examples.length).toBeGreaterThan(0)
  })

  it('should have valid example structure', () => {
    const example = examples[0]
    expect(example).toHaveProperty('name')
    expect(example).toHaveProperty('left')
    expect(example).toHaveProperty('right')
    expect(typeof example.name).toBe('string')
    expect(typeof example.left).toBe('string')
    expect(typeof example.right).toBe('string')
  })

  describe('getExample', () => {
    it('should return the first example by default', () => {
      const result = getExample()
      expect(result).toEqual(examples[0])
    })

    it('should return the correct example by index', () => {
      const result = getExample(0)
      expect(result).toEqual(examples[0])
    })

    it('should return first example if index is out of bounds', () => {
      const result = getExample(999)
      expect(result).toEqual(examples[0])
    })

    it('should return first example if index is negative', () => {
      const result = getExample(-1)
      expect(result).toEqual(examples[0])
    })
  })
})
