import type { ParseConfig } from '@sparklings/jago-parser'

/**
 * Validates if an object matches the ParseConfig schema
 * @param obj - The object to validate
 * @returns true if valid, false otherwise
 */
export function isValidParseConfig(obj: unknown): obj is ParseConfig {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  const config = obj as Record<string, unknown>

  // Check monthHeaderLocale (string | null)
  if (
    config.monthHeaderLocale !== null &&
    typeof config.monthHeaderLocale !== 'string'
  ) {
    return false
  }

  // Check skipRowPatterns (string array)
  if (
    !Array.isArray(config.skipRowPatterns) ||
    !config.skipRowPatterns.every(item => typeof item === 'string')
  ) {
    return false
  }

  // Check pageSelector (string)
  if (typeof config.pageSelector !== 'string') {
    return false
  }

  // Check timezone (string)
  if (typeof config.timezone !== 'string') {
    return false
  }

  // Check yTolerance (number)
  if (typeof config.yTolerance !== 'number') {
    return false
  }

  // Check xTolerance (number)
  if (typeof config.xTolerance !== 'number') {
    return false
  }

  return true
}

/**
 * Parse and validate config from JSON string
 * @param jsonString - JSON string to parse
 * @returns Parsed config or null if invalid
 */
export function parseConfigFromJSON(jsonString: string): ParseConfig | null {
  try {
    const parsed = JSON.parse(jsonString)
    if (isValidParseConfig(parsed)) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}
