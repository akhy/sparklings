import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

interface Fund {
  code: string
  productName: string
  investmentManager: string
  fundType: string
}

interface FundsData {
  funds: Fund[]
  metadata: {
    count: number
    lastUpdated: string
    source: string
  }
}

/**
 * Parse CSV file to array of objects
 */
function parseCSV(csvContent: string): Fund[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())

  const funds: Fund[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    // Simple CSV parser - handles quoted fields
    const values: string[] = []
    let currentValue = ''
    let insideQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]

      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim())
        currentValue = ''
      } else {
        currentValue += char
      }
    }
    values.push(currentValue.trim())

    // Create fund object
    const fund: Record<string, string> = {}
    headers.forEach((header, index) => {
      fund[header] = values[index] || ''
    })

    funds.push({
      code: fund.code || '',
      productName: fund.productName || '',
      investmentManager: fund.investmentManager || '',
      fundType: fund.fundType || '',
    })
  }

  return funds
}

/**
 * Main build function
 * Generates JSON from CSV that will be embedded in the published npm package
 */
function build() {
  console.log('🔨 Building reksadata package...')

  // Read CSV file
  const csvPath = join(rootDir, 'raw', 'funds.csv')
  console.log(`📄 Reading CSV from: ${csvPath}`)

  let csvContent: string
  try {
    csvContent = readFileSync(csvPath, 'utf-8')
  } catch (error) {
    console.error('❌ Error reading CSV file:', error)
    console.log('💡 Please create raw/funds.csv with your mutual funds data')
    console.log('   CSV format: code,productName,investmentManager,fundType')
    process.exit(1)
  }

  // Parse CSV
  console.log('⚙️  Parsing CSV...')
  const funds = parseCSV(csvContent)

  if (funds.length === 0) {
    console.error('❌ No funds found in CSV')
    process.exit(1)
  }

  // Create data structure
  const data: FundsData = {
    funds,
    metadata: {
      count: funds.length,
      lastUpdated: new Date().toISOString(),
      source: 'OJK (Otoritas Jasa Keuangan)',
    },
  }

  // Create output directory (will be compiled to dist/ by TypeScript)
  const outputDir = join(rootDir, 'src', 'data')
  mkdirSync(outputDir, { recursive: true })

  // Write JSON file - this will be imported by src/index.ts and bundled in npm package
  const outputPath = join(outputDir, 'funds.json')
  console.log(`💾 Writing JSON to: ${outputPath}`)
  console.log(`   (This file will be in dist/data/funds.json after TypeScript compilation)`)
  writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8')

  console.log('✅ Build complete!')
  console.log(`📊 Processed ${funds.length} mutual funds`)
  console.log(`🔍 Unique fund types: ${new Set(funds.map(f => f.fundType)).size}`)
  console.log(`🏢 Unique investment managers: ${new Set(funds.map(f => f.investmentManager)).size}`)
}

// Run build
build()
