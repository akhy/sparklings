export type EncodingMode = 'base64' | 'url' | 'hex'

export interface EncodingResult {
  success: boolean
  result: string
  error?: string
}

/**
 * Encode a plain text string using the specified encoding mode
 */
export function encode(plain: string, mode: EncodingMode): EncodingResult {
  try {
    let result = ''
    switch (mode) {
      case 'base64':
        result = btoa(plain)
        break
      case 'url':
        result = encodeURIComponent(plain)
        break
      case 'hex':
        result = Array.from(plain)
          .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
        break
    }
    return { success: true, result }
  } catch (error) {
    return {
      success: false,
      result: '',
      error: (error as Error).message,
    }
  }
}

/**
 * Decode an encoded string using the specified encoding mode
 */
export function decode(encoded: string, mode: EncodingMode): EncodingResult {
  try {
    let result = ''
    switch (mode) {
      case 'base64':
        result = atob(encoded)
        break
      case 'url':
        result = decodeURIComponent(encoded)
        break
      case 'hex':
        result = encoded.match(/.{1,2}/g)
          ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
          .join('') || ''
        break
    }
    return { success: true, result }
  } catch (error) {
    return {
      success: false,
      result: '',
      error: (error as Error).message,
    }
  }
}
