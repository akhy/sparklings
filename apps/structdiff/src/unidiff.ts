import { createTwoFilesPatch } from 'diff'
import * as yaml from 'js-yaml'

export type DiffFormat = 'json' | 'yaml'

export interface DiffOptions {
  format: DiffFormat
  contextLines?: number
}

const defaultOptions: DiffOptions = {
  format: 'json',
  contextLines: 3,
}

/**
 * Serialize object to string based on format
 */
function serialize(obj: unknown, format: DiffFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify(obj, null, 2)
    case 'yaml':
      return yaml.dump(obj, { indent: 2, lineWidth: -1 })
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

/**
 * Generate a unified diff between two objects
 *
 * @param left - Left object (already normalized)
 * @param right - Right object (already normalized)
 * @param options - Diff options
 * @returns Unified diff string
 */
export function diff(
  left: unknown,
  right: unknown,
  options: Partial<DiffOptions> = {}
): string {
  const opts = { ...defaultOptions, ...options }

  // Serialize both objects to strings
  const leftStr = serialize(left, opts.format)
  const rightStr = serialize(right, opts.format)

  // If identical, return empty string
  if (leftStr === rightStr) {
    return ''
  }

  // Generate unified diff
  const patch = createTwoFilesPatch(
    'left',
    'right',
    leftStr,
    rightStr,
    '',
    '',
    { context: opts.contextLines }
  )

  // Remove the file header lines (first 2 lines: --- and +++)
  const lines = patch.split('\n')
  return lines.slice(2).join('\n')
}
