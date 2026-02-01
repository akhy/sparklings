/**
 * @sparklings/jago-parser
 *
 * Parser for Bank Jago PDF transaction statements.
 * Extracts transaction data including timestamps, amounts, balances, and descriptions.
 */

// Export types
export type { Transaction, ProcessResult } from './types'
export type { ParseConfig } from './config'

// Export configuration
export { DEFAULT_CONFIG } from './config'

// Export main processor function
export { processPDF } from './processor'
