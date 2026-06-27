export interface LetterCounts {
  [char: string]: number
}

export interface LetterBalanceResult {
  leftMissing: string[]
  rightMissing: string[]
  isMatched: boolean
}

/**
 * Normalizes a string and counts occurrences of alphanumeric characters.
 */
export function getLetterCounts(str: string): LetterCounts {
  const counts: LetterCounts = {}
  const cleanStr = str.toUpperCase().replace(/[^A-Z0-9]/g, '')
  for (const char of cleanStr) {
    counts[char] = (counts[char] || 0) + 1
  }
  return counts
}

/**
 * Calculates the balance differences between two strings.
 * Returns arrays of characters missing from left (to match right) and right (to match left).
 */
export function calculateBalance(leftStr: string, rightStr: string): LetterBalanceResult {
  const leftCounts = getLetterCounts(leftStr)
  const rightCounts = getLetterCounts(rightStr)

  const leftMissing: string[] = []
  const rightMissing: string[] = []

  const allKeys = new Set([...Object.keys(leftCounts), ...Object.keys(rightCounts)])

  allKeys.forEach(char => {
    const leftCount = leftCounts[char] || 0
    const rightCount = rightCounts[char] || 0
    const diff = rightCount - leftCount

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        leftMissing.push(char)
      }
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) {
        rightMissing.push(char)
      }
    }
  })

  // Default state is sorted alphabetically
  leftMissing.sort()
  rightMissing.sort()

  const hasContent = leftStr.trim() !== '' && rightStr.trim() !== ''
  const isMatched = hasContent && leftMissing.length === 0 && rightMissing.length === 0

  return {
    leftMissing,
    rightMissing,
    isMatched
  }
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Returns a normalized, sorted representation of the alphanumeric characters of a string.
 * This represents the "contracted letters" signature of the string.
 */
export function getContractedKey(str: string): string {
  return str.toUpperCase().replace(/[^A-Z0-9]/g, '').split('').sort().join('')
}
