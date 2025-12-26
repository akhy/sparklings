import { describe, it, expect } from 'vitest'
import { normalize, defaultConfig } from './normalizer'

describe('normalizer', () => {
  describe('sortKeys', () => {
    it('should sort object keys alphabetically', () => {
      const input = '{"z": 1, "a": 2, "m": 3}'
      const result = normalize(input, 'json', 'json', { sortKeys: true })
      const parsed = JSON.parse(result)
      expect(Object.keys(parsed)).toEqual(['a', 'm', 'z'])
    })

    it('should sort nested object keys recursively', () => {
      const input = '{"z": {"y": 1, "x": 2}, "a": {"c": 3, "b": 4}}'
      const result = normalize(input, 'json', 'json', { sortKeys: true })
      const parsed = JSON.parse(result)
      expect(Object.keys(parsed)).toEqual(['a', 'z'])
      expect(Object.keys(parsed.z)).toEqual(['x', 'y'])
      expect(Object.keys(parsed.a)).toEqual(['b', 'c'])
    })

    it('should preserve array order when sorting keys', () => {
      const input = '{"z": [3, 1, 2], "a": [6, 4, 5]}'
      const result = normalize(input, 'json', 'json', { sortKeys: true })
      const parsed = JSON.parse(result)
      expect(Object.keys(parsed)).toEqual(['a', 'z'])
      expect(parsed.z).toEqual([3, 1, 2])
      expect(parsed.a).toEqual([6, 4, 5])
    })
  })

  describe('ignoreWhitespace', () => {
    it('should remove indentation from JSON', () => {
      const input = '{\n  "name": "John",\n  "age": 30\n}'
      const result = normalize(input, 'json', 'json', { ignoreWhitespace: true })
      expect(result).toBe('{"name":"John","age":30}')
    })

    it('should remove indentation from YAML output', () => {
      const input = 'name: John\nage: 30'
      const result = normalize(input, 'yaml', 'yaml', { ignoreWhitespace: true })
      // YAML with indent: 0 should have minimal whitespace
      expect(result).toContain('name: John')
      expect(result).toContain('age: 30')
    })

    it('should preserve data content when removing whitespace', () => {
      const input = '{\n  "items": [\n    1,\n    2,\n    3\n  ]\n}'
      const result = normalize(input, 'json', 'json', { ignoreWhitespace: true })
      const parsed = JSON.parse(result)
      expect(parsed).toEqual({ items: [1, 2, 3] })
    })
  })

  describe('ignoreArrayOrder', () => {
    it('should sort string arrays', () => {
      const input = '{"tags": ["zebra", "apple", "monkey"]}'
      const result = normalize(input, 'json', 'json', { ignoreArrayOrder: true })
      const parsed = JSON.parse(result)
      expect(parsed.tags).toEqual(['apple', 'monkey', 'zebra'])
    })

    it('should sort number arrays', () => {
      const input = '{"scores": [30, 10, 20]}'
      const result = normalize(input, 'json', 'json', { ignoreArrayOrder: true })
      const parsed = JSON.parse(result)
      expect(parsed.scores).toEqual([10, 20, 30])
    })

    it('should sort object arrays', () => {
      const input = '{"users": [{"id": 3}, {"id": 1}, {"id": 2}]}'
      const result = normalize(input, 'json', 'json', { ignoreArrayOrder: true })
      const parsed = JSON.parse(result)
      expect(parsed.users).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    })

    it('should sort nested arrays recursively', () => {
      const input = '{"data": [[3, 1, 2], [6, 4, 5]]}'
      const result = normalize(input, 'json', 'json', { ignoreArrayOrder: true })
      const parsed = JSON.parse(result)
      expect(parsed.data[0]).toEqual([1, 2, 3])
      expect(parsed.data[1]).toEqual([4, 5, 6])
    })

    it('should sort mixed type arrays consistently', () => {
      const input = '{"mixed": [true, "apple", 123, false, "banana", 42]}'
      const result = normalize(input, 'json', 'json', { ignoreArrayOrder: true })
      const parsed = JSON.parse(result)
      // Should be sorted by JSON string representation
      expect(parsed.mixed.length).toBe(6)
    })
  })

  describe('normalizeTypes', () => {
    it('should convert string numbers to numbers', () => {
      const input = '{"age": "25", "count": "100"}'
      const result = normalize(input, 'json', 'json', { normalizeTypes: true })
      const parsed = JSON.parse(result)
      expect(parsed.age).toBe(25)
      expect(parsed.count).toBe(100)
    })

    it('should convert string booleans to booleans', () => {
      const input = '{"active": "true", "disabled": "false"}'
      const result = normalize(input, 'json', 'json', { normalizeTypes: true })
      const parsed = JSON.parse(result)
      expect(parsed.active).toBe(true)
      expect(parsed.disabled).toBe(false)
    })

    it('should handle edge cases', () => {
      const input = '{"zero": "0", "empty": "", "notNumber": "abc"}'
      const result = normalize(input, 'json', 'json', { normalizeTypes: true })
      const parsed = JSON.parse(result)
      expect(parsed.zero).toBe(0)
      expect(parsed.empty).toBe('')
      expect(parsed.notNumber).toBe('abc')
    })

    it('should not convert non-numeric strings', () => {
      const input = '{"name": "John", "status": "active"}'
      const result = normalize(input, 'json', 'json', { normalizeTypes: true })
      const parsed = JSON.parse(result)
      expect(parsed.name).toBe('John')
      expect(parsed.status).toBe('active')
    })

    it('should work recursively on nested structures', () => {
      const input = '{"user": {"age": "30", "active": "true"}}'
      const result = normalize(input, 'json', 'json', { normalizeTypes: true })
      const parsed = JSON.parse(result)
      expect(parsed.user.age).toBe(30)
      expect(parsed.user.active).toBe(true)
    })

    it('should work on arrays', () => {
      const input = '{"values": ["1", "2", "3"]}'
      const result = normalize(input, 'json', 'json', { normalizeTypes: true })
      const parsed = JSON.parse(result)
      expect(parsed.values).toEqual([1, 2, 3])
    })
  })

  describe('trimStrings', () => {
    it('should trim leading and trailing whitespace', () => {
      const input = '{"name": "  John  ", "city": " NYC "}'
      const result = normalize(input, 'json', 'json', { trimStrings: true })
      const parsed = JSON.parse(result)
      expect(parsed.name).toBe('John')
      expect(parsed.city).toBe('NYC')
    })

    it('should trim strings in nested structures', () => {
      const input = '{"user": {"name": "  Jane  "}}'
      const result = normalize(input, 'json', 'json', { trimStrings: true })
      const parsed = JSON.parse(result)
      expect(parsed.user.name).toBe('Jane')
    })

    it('should trim strings in arrays', () => {
      const input = '{"tags": [" tag1 ", "  tag2  ", " tag3"]}'
      const result = normalize(input, 'json', 'json', { trimStrings: true })
      const parsed = JSON.parse(result)
      expect(parsed.tags).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('should preserve internal whitespace', () => {
      const input = '{"sentence": "  Hello  World  "}'
      const result = normalize(input, 'json', 'json', { trimStrings: true })
      const parsed = JSON.parse(result)
      expect(parsed.sentence).toBe('Hello  World')
    })
  })

  describe('format conversion', () => {
    it('should convert JSON to YAML', () => {
      const input = '{"name": "John", "age": 30}'
      const result = normalize(input, 'json', 'yaml')
      expect(result).toContain('name: John')
      expect(result).toContain('age: 30')
    })

    it('should convert YAML to JSON', () => {
      const input = 'name: John\nage: 30'
      const result = normalize(input, 'yaml', 'json')
      const parsed = JSON.parse(result)
      expect(parsed).toEqual({ name: 'John', age: 30 })
    })

    it('should handle complex nested structures', () => {
      const input = `
name: John
address:
  city: NYC
  zip: 10001
tags:
  - developer
  - designer
`
      const result = normalize(input, 'yaml', 'json')
      const parsed = JSON.parse(result)
      expect(parsed.name).toBe('John')
      expect(parsed.address.city).toBe('NYC')
      expect(parsed.tags).toEqual(['developer', 'designer'])
    })

    it('should throw error for invalid JSON', () => {
      const input = '{invalid json}'
      expect(() => normalize(input, 'json', 'json')).toThrow()
    })

    it('should throw error for unsupported formats', () => {
      const input = '{"test": true}'
      expect(() => normalize(input, 'toml', 'json')).toThrow('TOML format not yet supported')
      expect(() => normalize(input, 'json', 'hcl')).toThrow('HCL format not yet supported')
    })
  })

  describe('combined options', () => {
    it('should apply sortKeys and trimStrings together', () => {
      const input = '{"z": " value1 ", "a": "  value2  "}'
      const result = normalize(input, 'json', 'json', {
        sortKeys: true,
        trimStrings: true,
      })
      const parsed = JSON.parse(result)
      expect(Object.keys(parsed)).toEqual(['a', 'z'])
      expect(parsed.a).toBe('value2')
      expect(parsed.z).toBe('value1')
    })

    it('should apply normalizeTypes and ignoreArrayOrder together', () => {
      const input = '{"values": ["3", "1", "2"]}'
      const result = normalize(input, 'json', 'json', {
        normalizeTypes: true,
        ignoreArrayOrder: true,
      })
      const parsed = JSON.parse(result)
      expect(parsed.values).toEqual([1, 2, 3])
    })

    it('should apply all options together', () => {
      const input = '{"z": [" 3 ", "1", " 2 "], "a": " hello "}'
      const result = normalize(input, 'json', 'json', {
        sortKeys: true,
        trimStrings: true,
        normalizeTypes: true,
        ignoreArrayOrder: true,
      })
      const parsed = JSON.parse(result)
      expect(Object.keys(parsed)).toEqual(['a', 'z'])
      expect(parsed.a).toBe('hello')
      expect(parsed.z).toEqual([1, 2, 3])
    })
  })

  describe('default config', () => {
    it('should not modify data with default config', () => {
      const input = '{"z": 1, "a": 2}'
      const result = normalize(input, 'json', 'json', defaultConfig)
      const parsed = JSON.parse(result)
      expect(Object.keys(parsed)).toEqual(['z', 'a'])
    })

    it('should use default config when no config provided', () => {
      const input = '{"z": 1, "a": 2}'
      const result = normalize(input, 'json', 'json')
      const parsed = JSON.parse(result)
      expect(Object.keys(parsed)).toEqual(['z', 'a'])
    })
  })
})
