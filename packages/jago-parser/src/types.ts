/**
 * Represents a single transaction parsed from a Bank Jago PDF statement
 */
export interface Transaction {
  /** Unique transaction identifier */
  id: string
  /** ISO 8601 timestamp with timezone (e.g., "2024-12-24T14:30:00+07:00") */
  timestamp: string
  /** Transaction description */
  description: string
  /** Additional note, sometimes from the user who made the transaction */
  note: string
  /** Transaction amount (negative for debits, positive for credits) */
  amount: number
  /** Account balance after transaction */
  balance: number
  /** Transaction type */
  type: 'debit' | 'credit'
  /** Original index in the page for stable sorting */
  index: number
  /** Raw data extracted from PDF (for debugging/verification) */
  rawData: string[][]
}

/**
 * Result of PDF processing operation
 */
export interface ProcessResult {
  /** Array of parsed transactions */
  transactions: Transaction[]
  /** Total number of pages in the PDF */
  totalPages: number
}
