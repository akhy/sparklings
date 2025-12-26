import * as yaml from 'js-yaml'

export type Format = 'json' | 'yaml' | 'toml' | 'hcl'

export interface NormalizationConfig {
  sortKeys: boolean              // Alphabetically sort object keys
  ignoreWhitespace: boolean      // Normalize spacing/indentation (handled during serialization)
  ignoreArrayOrder: boolean      // Treat arrays as sets (sort them)
  normalizeTypes: boolean        // "123" === 123, "true" === true
  trimStrings: boolean           // " hello " === "hello"
}

export const defaultConfig: NormalizationConfig = {
  sortKeys: false,
  ignoreWhitespace: false,
  ignoreArrayOrder: false,
  normalizeTypes: false,
  trimStrings: false,
}

/**
 * Parse input string to JavaScript object based on format
 */
function parse(input: string, format: Format): unknown {
  switch (format) {
    case 'json':
      return JSON.parse(input)
    case 'yaml':
      return yaml.load(input)
    case 'toml':
      throw new Error('TOML format not yet supported')
    case 'hcl':
      throw new Error('HCL format not yet supported')
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}


/**
 * Normalize a value based on configuration
 */
function normalizeValue(value: unknown, config: NormalizationConfig): unknown {
  // Handle strings
  if (typeof value === 'string') {
    let result = value

    // Trim strings
    if (config.trimStrings) {
      result = result.trim()
    }

    // Normalize types
    if (config.normalizeTypes) {
      // Try to parse as number
      const num = Number(result)
      if (!isNaN(num) && result !== '') {
        return num
      }

      // Try to parse as boolean
      if (result === 'true') return true
      if (result === 'false') return false
    }

    return result
  }

  // Handle arrays
  if (Array.isArray(value)) {
    const normalized = value.map(item => normalizeValue(item, config))

    // Sort array if ignoreArrayOrder is enabled
    if (config.ignoreArrayOrder) {
      return normalized.sort((a, b) => {
        const aStr = JSON.stringify(a)
        const bStr = JSON.stringify(b)
        return aStr.localeCompare(bStr)
      })
    }

    return normalized
  }

  // Handle objects
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const result: Record<string, unknown> = {}

    // Get keys and optionally sort them
    const keys = Object.keys(obj)
    const sortedKeys = config.sortKeys ? keys.sort() : keys

    for (const key of sortedKeys) {
      result[key] = normalizeValue(obj[key], config)
    }

    return result
  }

  // Return primitive values as-is
  return value
}

/**
 * Normalize a structured data string to a JavaScript object
 *
 * @param input - Input string to normalize
 * @param inputFormat - Format of the input string
 * @param config - Normalization configuration
 * @returns Normalized JavaScript object
 */
export function normalize(
  input: string,
  inputFormat: Format,
  config: Partial<NormalizationConfig> = {}
): unknown {
  const fullConfig: NormalizationConfig = { ...defaultConfig, ...config }

  try {
    // Parse input
    const parsed = parse(input, inputFormat)

    // Normalize and return JS object
    return normalizeValue(parsed, fullConfig)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Normalization failed: ${error.message}`)
    }
    throw error
  }
}
