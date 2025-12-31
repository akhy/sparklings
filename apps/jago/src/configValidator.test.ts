import { describe, it, expect } from 'vitest'
import { isValidParseConfig, parseConfigFromJSON } from './configValidator'
import { DEFAULT_CONFIG } from './config'

describe('isValidParseConfig', () => {
  it('should validate a correct config', () => {
    const validConfig = {
      monthHeaderLocale: 'en',
      skipRowPatterns: ['pattern1', 'pattern2'],
      pageSelector: '1',
      timezone: '+07:00',
      yTolerance: 10,
      xTolerance: 5,
    }

    expect(isValidParseConfig(validConfig)).toBe(true)
  })

  it('should validate DEFAULT_CONFIG', () => {
    expect(isValidParseConfig(DEFAULT_CONFIG)).toBe(true)
  })

  it('should accept null for monthHeaderLocale', () => {
    const config = {
      monthHeaderLocale: null,
      skipRowPatterns: [],
      pageSelector: '1',
      timezone: '+07:00',
      yTolerance: 10,
      xTolerance: 5,
    }

    expect(isValidParseConfig(config)).toBe(true)
  })

  it('should reject non-object values', () => {
    expect(isValidParseConfig(null)).toBe(false)
    expect(isValidParseConfig(undefined)).toBe(false)
    expect(isValidParseConfig('string')).toBe(false)
    expect(isValidParseConfig(123)).toBe(false)
    expect(isValidParseConfig([])).toBe(false)
  })

  it('should reject config with invalid monthHeaderLocale type', () => {
    const invalidConfig = {
      monthHeaderLocale: 123, // Should be string or null
      skipRowPatterns: [],
      pageSelector: '1',
      timezone: '+07:00',
      yTolerance: 10,
      xTolerance: 5,
    }

    expect(isValidParseConfig(invalidConfig)).toBe(false)
  })

  it('should reject config with invalid skipRowPatterns type', () => {
    const invalidConfig1 = {
      monthHeaderLocale: 'en',
      skipRowPatterns: 'not an array', // Should be array
      pageSelector: '1',
      timezone: '+07:00',
      yTolerance: 10,
      xTolerance: 5,
    }

    const invalidConfig2 = {
      monthHeaderLocale: 'en',
      skipRowPatterns: [1, 2, 3], // Should be string array
      pageSelector: '1',
      timezone: '+07:00',
      yTolerance: 10,
      xTolerance: 5,
    }

    expect(isValidParseConfig(invalidConfig1)).toBe(false)
    expect(isValidParseConfig(invalidConfig2)).toBe(false)
  })

  it('should reject config with invalid pageSelector type', () => {
    const invalidConfig = {
      monthHeaderLocale: 'en',
      skipRowPatterns: [],
      pageSelector: 123, // Should be string
      timezone: '+07:00',
      yTolerance: 10,
      xTolerance: 5,
    }

    expect(isValidParseConfig(invalidConfig)).toBe(false)
  })

  it('should reject config with invalid timezone type', () => {
    const invalidConfig = {
      monthHeaderLocale: 'en',
      skipRowPatterns: [],
      pageSelector: '1',
      timezone: 7, // Should be string
      yTolerance: 10,
      xTolerance: 5,
    }

    expect(isValidParseConfig(invalidConfig)).toBe(false)
  })

  it('should reject config with invalid tolerance types', () => {
    const invalidConfig1 = {
      monthHeaderLocale: 'en',
      skipRowPatterns: [],
      pageSelector: '1',
      timezone: '+07:00',
      yTolerance: '10', // Should be number
      xTolerance: 5,
    }

    const invalidConfig2 = {
      monthHeaderLocale: 'en',
      skipRowPatterns: [],
      pageSelector: '1',
      timezone: '+07:00',
      yTolerance: 10,
      xTolerance: '5', // Should be number
    }

    expect(isValidParseConfig(invalidConfig1)).toBe(false)
    expect(isValidParseConfig(invalidConfig2)).toBe(false)
  })

  it('should reject config with missing required fields', () => {
    const incompleteConfig = {
      monthHeaderLocale: 'en',
      skipRowPatterns: [],
      // Missing pageSelector, timezone, yTolerance, xTolerance
    }

    expect(isValidParseConfig(incompleteConfig)).toBe(false)
  })
})

describe('parseConfigFromJSON', () => {
  it('should parse valid JSON config', () => {
    const json = JSON.stringify({
      monthHeaderLocale: 'en',
      skipRowPatterns: ['test'],
      pageSelector: '1',
      timezone: '+07:00',
      yTolerance: 10,
      xTolerance: 5,
    })

    const result = parseConfigFromJSON(json)
    expect(result).not.toBeNull()
    expect(result?.monthHeaderLocale).toBe('en')
  })

  it('should return null for invalid JSON', () => {
    const invalidJson = '{ invalid json }'
    expect(parseConfigFromJSON(invalidJson)).toBeNull()
  })

  it('should return null for valid JSON but invalid schema', () => {
    const json = JSON.stringify({
      monthHeaderLocale: 'en',
      // Missing required fields
    })

    expect(parseConfigFromJSON(json)).toBeNull()
  })

  it('should parse DEFAULT_CONFIG JSON', () => {
    const json = JSON.stringify(DEFAULT_CONFIG)
    const result = parseConfigFromJSON(json)

    expect(result).not.toBeNull()
    expect(result).toEqual(DEFAULT_CONFIG)
  })

  it('should return null for empty string', () => {
    expect(parseConfigFromJSON('')).toBeNull()
  })

  it('should return null for non-object JSON', () => {
    expect(parseConfigFromJSON('"string"')).toBeNull()
    expect(parseConfigFromJSON('123')).toBeNull()
    expect(parseConfigFromJSON('[]')).toBeNull()
    expect(parseConfigFromJSON('null')).toBeNull()
  })
})
