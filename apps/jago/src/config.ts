export interface ParseConfig {
  monthHeaderLocale: string | null
  skipRowPatterns: string[]
  pageSelector: string
  timezone: string // Timezone offset for timestamps (e.g., '+07:00' for Jakarta)
  yTolerance: number // Y-coordinate tolerance in pixels for grouping items into same line
  xTolerance: number // X-coordinate tolerance in pixels for detecting same column (merging wrapped text)
}

export const DEFAULT_CONFIG: ParseConfig = {
  monthHeaderLocale: 'en',
  skipRowPatterns: [
    'Page \\d+ of \\d+',
    'also a member of Indonesia Deposit Insurance Corporation',
    'PT Bank Jago Tbk is licensed',
    'www\\.jago\\.com',
    'Disclaimer',
    'This document is your list of Jago Transaction History',
    'based on search result and filter Customer has applied',
  ],
  pageSelector: '1',
  timezone: '+07:00', // Jakarta time (GMT+7)
  yTolerance: 10, // 10 pixels tolerance for Y-coordinate grouping
  xTolerance: 5, // 5 pixels tolerance for X-coordinate column alignment
}
