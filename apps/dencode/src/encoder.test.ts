import { describe, it, expect } from 'vitest'
import { encode, decode } from './encoder'

describe('encoder', () => {
  describe('base64 encoding', () => {
    it('should encode plain text to base64', () => {
      const result = encode('Hello World', 'base64')
      expect(result.success).toBe(true)
      expect(result.result).toBe('SGVsbG8gV29ybGQ=')
    })

    it('should encode empty string to base64', () => {
      const result = encode('', 'base64')
      expect(result.success).toBe(true)
      expect(result.result).toBe('')
    })

    it('should handle non-ASCII characters in base64 with error', () => {
      const result = encode('Hello 世界!', 'base64')
      // btoa doesn't support non-ASCII characters without UTF-8 encoding
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('should encode numbers to base64', () => {
      const result = encode('12345', 'base64')
      expect(result.success).toBe(true)
      expect(result.result).toBe('MTIzNDU=')
    })
  })

  describe('base64 decoding', () => {
    it('should decode base64 to plain text', () => {
      const result = decode('SGVsbG8gV29ybGQ=', 'base64')
      expect(result.success).toBe(true)
      expect(result.result).toBe('Hello World')
    })

    it('should decode empty base64 string', () => {
      const result = decode('', 'base64')
      expect(result.success).toBe(true)
      expect(result.result).toBe('')
    })

    it('should handle invalid base64 with error', () => {
      const result = decode('Invalid!!!', 'base64')
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('should decode numbers from base64', () => {
      const result = decode('MTIzNDU=', 'base64')
      expect(result.success).toBe(true)
      expect(result.result).toBe('12345')
    })
  })

  describe('url encoding', () => {
    it('should encode plain text to URL format', () => {
      const result = encode('Hello World', 'url')
      expect(result.success).toBe(true)
      expect(result.result).toBe('Hello%20World')
    })

    it('should encode special characters for URL', () => {
      const result = encode('key=value&foo=bar', 'url')
      expect(result.success).toBe(true)
      expect(result.result).toBe('key%3Dvalue%26foo%3Dbar')
    })

    it('should encode empty string for URL', () => {
      const result = encode('', 'url')
      expect(result.success).toBe(true)
      expect(result.result).toBe('')
    })

    it('should encode unicode characters for URL', () => {
      const result = encode('こんにちは', 'url')
      expect(result.success).toBe(true)
      expect(result.result).toBeTruthy()
    })

    it('should encode symbols for URL', () => {
      const result = encode('!@#$%^&*()', 'url')
      expect(result.success).toBe(true)
      expect(result.result).toBe('!%40%23%24%25%5E%26*()')
    })
  })

  describe('url decoding', () => {
    it('should decode URL encoded text', () => {
      const result = decode('Hello%20World', 'url')
      expect(result.success).toBe(true)
      expect(result.result).toBe('Hello World')
    })

    it('should decode URL encoded special characters', () => {
      const result = decode('key%3Dvalue%26foo%3Dbar', 'url')
      expect(result.success).toBe(true)
      expect(result.result).toBe('key=value&foo=bar')
    })

    it('should decode empty URL string', () => {
      const result = decode('', 'url')
      expect(result.success).toBe(true)
      expect(result.result).toBe('')
    })

    it('should handle invalid URL encoding with error', () => {
      const result = decode('%ZZ', 'url')
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('should decode URL encoded symbols', () => {
      const result = decode('!%40%23%24%25%5E%26*()', 'url')
      expect(result.success).toBe(true)
      expect(result.result).toBe('!@#$%^&*()')
    })
  })

  describe('hex encoding', () => {
    it('should encode plain text to hex', () => {
      const result = encode('Hello', 'hex')
      expect(result.success).toBe(true)
      expect(result.result).toBe('48656c6c6f')
    })

    it('should encode single character to hex', () => {
      const result = encode('A', 'hex')
      expect(result.success).toBe(true)
      expect(result.result).toBe('41')
    })

    it('should encode empty string to hex', () => {
      const result = encode('', 'hex')
      expect(result.success).toBe(true)
      expect(result.result).toBe('')
    })

    it('should encode numbers to hex', () => {
      const result = encode('123', 'hex')
      expect(result.success).toBe(true)
      expect(result.result).toBe('313233')
    })

    it('should encode special characters to hex', () => {
      const result = encode('!@#', 'hex')
      expect(result.success).toBe(true)
      expect(result.result).toBe('214023')
    })

    it('should pad hex values with leading zeros', () => {
      const result = encode('\n', 'hex')
      expect(result.success).toBe(true)
      expect(result.result).toBe('0a')
    })
  })

  describe('hex decoding', () => {
    it('should decode hex to plain text', () => {
      const result = decode('48656c6c6f', 'hex')
      expect(result.success).toBe(true)
      expect(result.result).toBe('Hello')
    })

    it('should decode single hex character', () => {
      const result = decode('41', 'hex')
      expect(result.success).toBe(true)
      expect(result.result).toBe('A')
    })

    it('should decode empty hex string', () => {
      const result = decode('', 'hex')
      expect(result.success).toBe(true)
      expect(result.result).toBe('')
    })

    it('should decode hex numbers', () => {
      const result = decode('313233', 'hex')
      expect(result.success).toBe(true)
      expect(result.result).toBe('123')
    })

    it('should decode hex special characters', () => {
      const result = decode('214023', 'hex')
      expect(result.success).toBe(true)
      expect(result.result).toBe('!@#')
    })

    it('should handle odd-length hex strings', () => {
      const result = decode('123', 'hex')
      expect(result.success).toBe(true)
      // Odd length should be handled gracefully
      expect(result.result).toBeTruthy()
    })
  })

  describe('round-trip encoding', () => {
    const testStrings = [
      'Hello World',
      'Testing 123',
      '!@#$%^&*()',
      'Multi\nLine\nText',
      '',
      'Single',
    ]

    testStrings.forEach((text) => {
      it(`should round-trip base64 encode/decode: "${text}"`, () => {
        const encoded = encode(text, 'base64')
        expect(encoded.success).toBe(true)
        const decoded = decode(encoded.result, 'base64')
        expect(decoded.success).toBe(true)
        expect(decoded.result).toBe(text)
      })

      it(`should round-trip url encode/decode: "${text}"`, () => {
        const encoded = encode(text, 'url')
        expect(encoded.success).toBe(true)
        const decoded = decode(encoded.result, 'url')
        expect(decoded.success).toBe(true)
        expect(decoded.result).toBe(text)
      })

      it(`should round-trip hex encode/decode: "${text}"`, () => {
        const encoded = encode(text, 'hex')
        expect(encoded.success).toBe(true)
        const decoded = decode(encoded.result, 'hex')
        expect(decoded.success).toBe(true)
        expect(decoded.result).toBe(text)
      })
    })
  })

  describe('error handling', () => {
    it('should return error for invalid base64', () => {
      const result = decode('Not@Valid@Base64', 'base64')
      expect(result.success).toBe(false)
      expect(result.result).toBe('')
      expect(result.error).toBeTruthy()
    })

    it('should return error for invalid URL encoding', () => {
      const result = decode('%GG', 'url')
      expect(result.success).toBe(false)
      expect(result.result).toBe('')
      expect(result.error).toBeTruthy()
    })
  })

  describe('consistency across modes', () => {
    it('should handle same input differently for each mode', () => {
      const input = 'Test'
      const base64Result = encode(input, 'base64')
      const urlResult = encode(input, 'url')
      const hexResult = encode(input, 'hex')

      expect(base64Result.result).not.toBe(urlResult.result)
      expect(base64Result.result).not.toBe(hexResult.result)
      expect(urlResult.result).not.toBe(hexResult.result)

      // All should be successful
      expect(base64Result.success).toBe(true)
      expect(urlResult.success).toBe(true)
      expect(hexResult.success).toBe(true)
    })
  })
})
