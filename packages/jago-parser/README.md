# @sparklings/jago-parser

Parser for Bank Jago PDF transaction statements. Extracts transaction data including timestamps, amounts, balances, and descriptions.

## Features

- Parse Bank Jago PDF statements
- Extract transaction details (ID, timestamp, amount, balance, description)
- Configurable parsing options (timezone, page selection, filtering)
- Support for both debit and credit transactions
- Handles multi-line transaction descriptions
- Page range selection (e.g., '1', '1-5', '1,3,5-7', 'all')

## Installation

This is an internal workspace package. Add it to your app's dependencies:

```json
{
  "dependencies": {
    "@sparklings/jago-parser": "workspace:*"
  }
}
```

## Usage

```typescript
import { processPDF, DEFAULT_CONFIG, type Transaction } from '@sparklings/jago-parser'

// Process a PDF file
const file: File = // ... get file from input
const result = await processPDF(file, DEFAULT_CONFIG)

console.log(`Parsed ${result.transactions.length} transactions from ${result.totalPages} pages`)

// Access transactions
result.transactions.forEach((transaction: Transaction) => {
  console.log(`${transaction.timestamp}: ${transaction.description} - ${transaction.amount}`)
})
```

## Configuration

Customize parsing behavior with `ParseConfig`:

```typescript
import { processPDF, type ParseConfig } from '@sparklings/jago-parser'

const config: ParseConfig = {
  monthHeaderLocale: 'en',     // 'en' | 'id' | null
  pageSelector: '1-3',         // Page range to parse
  timezone: '+07:00',          // Timezone for timestamps
  yTolerance: 10,              // Y-axis grouping tolerance
  xTolerance: 5,               // X-axis column alignment tolerance
  skipRowPatterns: [           // Regex patterns to skip
    'Page \\d+ of \\d+',
    'Disclaimer',
  ],
}

const result = await processPDF(file, config)
```

## Types

### Transaction

```typescript
interface Transaction {
  id: string                   // Transaction ID
  timestamp: string            // ISO 8601 timestamp with timezone
  description: string          // Transaction description
  note: string                 // Additional notes
  amount: number               // Transaction amount
  balance: number              // Account balance after transaction
  type: 'debit' | 'credit'     // Transaction type
  index: number                // Original index for stable sorting
  rawData: string[][]          // Raw extracted data
}
```

### ProcessResult

```typescript
interface ProcessResult {
  transactions: Transaction[]  // Parsed transactions
  totalPages: number           // Total pages in PDF
}
```

## License

Part of the Sparklings monorepo.
