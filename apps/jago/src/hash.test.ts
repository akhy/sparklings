import { describe, it, expect } from 'vitest'
import { hashString } from './hash'

describe('hashString', () => {
  it('should generate consistent hashes for the same input', () => {
    const input = 'test string'
    const hash1 = hashString(input)
    const hash2 = hashString(input)

    expect(hash1).toBe(hash2)
  })

  it('should generate different hashes for different inputs', () => {
    const hash1 = hashString('string1')
    const hash2 = hashString('string2')

    expect(hash1).not.toBe(hash2)
  })

  it('should always return an 8-character string', () => {
    const inputs = [
      '',
      'a',
      'short',
      'a much longer string with many characters',
      '{"key": "value", "nested": {"data": true}}',
    ]

    inputs.forEach(input => {
      const hash = hashString(input)
      expect(hash).toHaveLength(8)
    })
  })

  it('should only contain alphanumeric characters (base36)', () => {
    const inputs = ['test', 'another test', '{"complex": "json"}']

    inputs.forEach(input => {
      const hash = hashString(input)
      expect(hash).toMatch(/^[0-9a-z]{8}$/)
    })
  })

  it('should generate the same hash for identical JSON configs', () => {
    const config1 = JSON.stringify({
      monthHeaderLocale: 'en',
      skipRowPatterns: ['pattern1', 'pattern2'],
      pageSelector: '1',
      timezone: '+07:00',
      yTolerance: 10,
      xTolerance: 5,
    })

    const config2 = JSON.stringify({
      monthHeaderLocale: 'en',
      skipRowPatterns: ['pattern1', 'pattern2'],
      pageSelector: '1',
      timezone: '+07:00',
      yTolerance: 10,
      xTolerance: 5,
    })

    expect(hashString(config1)).toBe(hashString(config2))
  })

  it('should generate different hashes for different configs', () => {
    const config1 = JSON.stringify({
      monthHeaderLocale: 'en',
      timezone: '+07:00',
    })

    const config2 = JSON.stringify({
      monthHeaderLocale: 'id',
      timezone: '+08:00',
    })

    expect(hashString(config1)).not.toBe(hashString(config2))
  })

  it('should handle empty string', () => {
    const hash = hashString('')
    expect(hash).toHaveLength(8)
    expect(hash).toMatch(/^[0-9a-z]{8}$/)
  })

  it('should handle special characters', () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:",.<>?/'
    const hash = hashString(specialChars)
    expect(hash).toHaveLength(8)
    expect(hash).toMatch(/^[0-9a-z]{8}$/)
  })
})
