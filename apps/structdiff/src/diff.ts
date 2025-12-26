import { create } from 'jsondiffpatch'
import { format } from 'jsondiffpatch/formatters/console'

export type DiffFormat = 'json' | 'yaml'

export interface DiffOptions {
  format: DiffFormat
}

const defaultOptions: DiffOptions = {
  format: 'json',
}

/**
 * Generate a structured diff between two objects
 *
 * @param left - Left object (already normalized)
 * @param right - Right object (already normalized)
 * @param options - Diff options
 * @returns Diff string in console format
 */
export function diff(
  left: unknown,
  right: unknown,
  options: Partial<DiffOptions> = {}
): string {
  const opts = { ...defaultOptions, ...options }

  if (opts.format === 'yaml') {
    throw new Error('YAML diff format not yet implemented')
  }

  // Create jsondiffpatch instance
  const differ = create({
    arrays: {
      // Use LCS algorithm for better array diffing
      detectMove: true,
    },
  })

  // Calculate delta
  const delta = differ.diff(left, right)

  // No differences
  if (!delta) {
    return 'No differences found.'
  }

  // Format delta as console output
  const result = format(delta, left)
  return result || 'No differences found.'
}
