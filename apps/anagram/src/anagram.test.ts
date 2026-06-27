import { describe, it, expect } from 'vitest'
import { getLetterCounts, calculateBalance, shuffleArray } from './anagram'

describe('anagram helpers', () => {
  describe('getLetterCounts', () => {
    it('should count letters and numbers ignoring case and special characters', () => {
      const counts = getLetterCounts('Hello, World! 123')
      expect(counts['H']).toBe(1)
      expect(counts['E']).toBe(1)
      expect(counts['L']).toBe(3)
      expect(counts['O']).toBe(2)
      expect(counts['W']).toBe(1)
      expect(counts['R']).toBe(1)
      expect(counts['D']).toBe(1)
      expect(counts['1']).toBe(1)
      expect(counts['2']).toBe(1)
      expect(counts['3']).toBe(1)
      expect(counts[',']).toBeUndefined()
      expect(counts['!']).toBeUndefined()
    })

    it('should return empty object for string without alphanumeric characters', () => {
      const counts = getLetterCounts('!!! @#$')
      expect(counts).toEqual({})
    })
  })

  describe('calculateBalance', () => {
    it('should detect matching anagrams', () => {
      const result = calculateBalance('listen', 'silent')
      expect(result.isMatched).toBe(true)
      expect(result.leftMissing).toEqual([])
      expect(result.rightMissing).toEqual([])
    })

    it('should identify missing characters from left', () => {
      const result = calculateBalance('cat', 'carts')
      expect(result.isMatched).toBe(false)
      expect(result.leftMissing).toEqual(['R', 'S'])
      expect(result.rightMissing).toEqual([])
    })

    it('should identify missing characters from right', () => {
      const result = calculateBalance('carts', 'cat')
      expect(result.isMatched).toBe(false)
      expect(result.leftMissing).toEqual([])
      expect(result.rightMissing).toEqual(['R', 'S'])
    })

    it('should identify overlapping balance differences', () => {
      const result = calculateBalance('hello', 'world')
      // hello: h, e, l:2, o
      // world: w, o, r, l, d
      // left needs: d, r, w (from world, matching l and o)
      // right needs: e, h, l (from hello, matching l and o)
      expect(result.isMatched).toBe(false)
      expect(result.leftMissing).toEqual(['D', 'R', 'W'])
      expect(result.rightMissing).toEqual(['E', 'H', 'L'])
    })

    it('should not match empty strings', () => {
      const result = calculateBalance('', '')
      expect(result.isMatched).toBe(false)
      expect(result.leftMissing).toEqual([])
      expect(result.rightMissing).toEqual([])
    })
  })

  describe('shuffleArray', () => {
    it('should contain the same items after shuffle', () => {
      const original = ['A', 'B', 'C', 'D', 'E']
      const shuffled = shuffleArray(original)
      expect(shuffled.length).toBe(original.length)
      expect(shuffled.sort()).toEqual(original.sort())
    })
  })
})
