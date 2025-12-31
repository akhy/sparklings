/**
 * Generate a consistent short hash from a string
 * Uses a simple 32-bit hash algorithm (djb2-like)
 *
 * @param str - The string to hash
 * @returns An 8-character base36 hash
 */
export function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  // Convert to base36 and take first 8 characters for short hash
  return Math.abs(hash).toString(36).padStart(8, '0').slice(0, 8)
}
