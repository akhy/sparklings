# @sparklings/reksadata

> Indonesian mutual funds directory data - headless data package

A lightweight, type-safe npm package providing a complete directory of mutual funds (Reksa Dana) registered in Indonesia. Data is sourced from OJK (Otoritas Jasa Keuangan) and embedded directly in the package for offline usage.

## Features

- 🚀 **Zero dependencies** - Pure data package
- 📦 **Embedded data** - Works offline, no API calls needed
- 🔒 **Type-safe** - Full TypeScript support
- 🎯 **Headless** - No UI, just data and utilities
- 🔍 **Searchable** - Helper functions for filtering and searching

## Installation

```bash
npm install @sparklings/reksadata
# or
pnpm add @sparklings/reksadata
# or
yarn add @sparklings/reksadata
```

## Usage

### Basic Usage

```typescript
import { funds, metadata } from '@sparklings/reksadata'

console.log(`Total funds: ${metadata.count}`)
console.log(`Last updated: ${metadata.lastUpdated}`)

// Access all funds
funds.forEach(fund => {
  console.log(`${fund.code}: ${fund.productName}`)
})
```

### Find by Code

```typescript
import { findByCode } from '@sparklings/reksadata'

const fund = findByCode('BPAM001')
if (fund) {
  console.log(fund.productName)
  console.log(fund.investmentManager)
  console.log(fund.fundType)
}
```

### Filter by Type

```typescript
import { filterByType } from '@sparklings/reksadata'

const equityFunds = filterByType('Saham')
console.log(`Found ${equityFunds.length} equity funds`)
```

### Filter by Investment Manager

```typescript
import { filterByManager } from '@sparklings/reksadata'

const bniFunds = filterByManager('PT BNI Asset Management')
console.log(`BNI-AM manages ${bniFunds.length} funds`)
```

### Search by Name

```typescript
import { searchByName } from '@sparklings/reksadata'

const results = searchByName('pendapatan')
console.log(`Found ${results.length} funds matching "pendapatan"`)
```

### Get Unique Values

```typescript
import { getFundTypes, getInvestmentManagers } from '@sparklings/reksadata'

const types = getFundTypes()
console.log('Available fund types:', types)

const managers = getInvestmentManagers()
console.log(`Total investment managers: ${managers.length}`)
```

## Data Structure

### Fund Type

```typescript
interface Fund {
  code: string                  // Fund code (e.g., "BPAM001")
  productName: string           // Fund name
  investmentManager: string     // Investment manager name
  fundType: FundType           // Fund category
}
```

### Fund Types

Common fund types in Indonesia:

- `Pasar Uang` - Money Market
- `Pendapatan Tetap` - Fixed Income
- `Saham` - Equity/Stock
- `Campuran` - Balanced/Mixed
- `Indeks` - Index
- `Terproteksi` - Protected
- `Syariah Pasar Uang` - Sharia Money Market
- `Syariah Pendapatan Tetap` - Sharia Fixed Income
- `Syariah Saham` - Sharia Equity
- `Syariah Campuran` - Sharia Balanced
- `ETF` - Exchange Traded Fund

## API Reference

### Data Exports

- `funds: Fund[]` - Array of all mutual funds
- `data: FundsData` - Full dataset with metadata
- `metadata` - Dataset metadata (count, lastUpdated, source)

### Utility Functions

- `findByCode(code: string): Fund | undefined` - Find fund by code
- `filterByType(fundType: FundType): Fund[]` - Filter by fund type
- `filterByManager(investmentManager: string): Fund[]` - Filter by investment manager
- `searchByName(query: string): Fund[]` - Search funds by name (case-insensitive)
- `getFundTypes(): FundType[]` - Get all unique fund types
- `getInvestmentManagers(): string[]` - Get all unique investment managers

### TypeScript Types

```typescript
import type { Fund, FundsData, FundType } from '@sparklings/reksadata'
```

## Data Source

Data is sourced from **OJK (Otoritas Jasa Keuangan)**, Indonesia's financial services authority.

## Updates

This package is updated manually when new mutual funds are registered or fund information changes. Check the `metadata.lastUpdated` field for the last update timestamp.

## License

MIT

## Related Projects

For a web-based directory with search UI, see the companion static site project (link TBD).
