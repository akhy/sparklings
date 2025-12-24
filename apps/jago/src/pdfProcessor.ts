import * as pdfjsLib from 'pdfjs-dist'
import parseNumericRange from 'parse-numeric-range'

export interface Transaction {
  id: string
  date: Date
  description: string
  amount: number
  balance: number
  type: 'debit' | 'credit'
  rawRows: string[][]
}

export interface ParseConfig {
  monthHeaderLocale: string | null
  skipRowPatterns: string[]
  pageSelector: string
}

export const DEFAULT_CONFIG: ParseConfig = {
  monthHeaderLocale: 'en',
  skipRowPatterns: [
    'Page \\d+ of \\d+',
    'also a member of Indonesia Deposit Insurance Corporation',
    'PT Bank Jago Tbk is licensed',
    'www\\.jago\\.com',
  ],
  pageSelector: '1',
}

// Processing pipeline functions
const extractTextItems = (textContent: any) => {
  console.log('\n=== RAW TEXT ITEMS (with positions) ===')
  textContent.items.forEach((item: any, index: number) => {
    console.log(`[${index}] x:${item.transform[4].toFixed(1)} y:${item.transform[5].toFixed(1)} "${item.str}"`)
  })
  return textContent.items
}

const groupIntoLines = (items: any[]): string[][] => {
  const lines: { [key: number]: string[] } = {}
  items.forEach((item: any) => {
    const y = Math.round(item.transform[5])
    if (!lines[y]) lines[y] = []
    lines[y].push(item.str)
  })

  const sortedLines = Object.keys(lines)
    .sort((a, b) => parseInt(b) - parseInt(a))
    .map(y => lines[parseInt(y)])

  console.log('\n=== LINES AS 2D ARRAY (columns preserved) ===')
  sortedLines.forEach((columns, index) => {
    console.log(`[${index}]`, columns)
  })

  return sortedLines
}

const createFilterRows = (config: ParseConfig) => (lines: string[][]): string[][] => {
  const localeMonthNames: { [key: string]: string[] } = {
    'en': ['January', 'February', 'March', 'April', 'May', 'June',
           'July', 'August', 'September', 'October', 'November', 'December'],
    'id': ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
           'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  }

  const monthHeaderPattern = config.monthHeaderLocale
    ? new RegExp(`^(${localeMonthNames[config.monthHeaderLocale]?.join('|')})\\s+\\d{4}$`, 'i')
    : null

  const skipRowPatterns = config.skipRowPatterns
    .map(pattern => {
      try {
        return new RegExp(pattern, 'i')
      } catch {
        console.warn(`Invalid skip pattern: ${pattern}`)
        return null
      }
    })
    .filter((p): p is RegExp => p !== null)

  const filtered = lines.filter((columns) => {
    const rowText = columns.join(' ').trim()

    if (monthHeaderPattern && monthHeaderPattern.test(rowText)) {
      console.log(`[SKIP] Month header: "${rowText}"`)
      return false
    }

    for (const pattern of skipRowPatterns) {
      if (pattern.test(rowText)) {
        console.log(`[SKIP] Pattern match: "${rowText}"`)
        return false
      }
    }

    return true
  })

  console.log(`\n=== FILTERED ${lines.length - filtered.length} row(s) ===`)
  return filtered
}

const groupIntoTransactions = (lines: string[][]): string[][][] => {
  const datePattern = /^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/
  const groups: string[][][] = []
  let currentGroup: string[][] = []
  let inGroup = false
  let rowsAfterEndMarker = 0
  const BUFFER_ROWS = 3

  for (const columns of lines) {
    const hasDateMarker = columns.some(cell => datePattern.test(cell.trim()))
    const hasEndMarker = columns.some(cell => cell.trim().startsWith('ID#'))

    if (hasDateMarker) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup)
      }
      currentGroup = [columns]
      inGroup = true
      rowsAfterEndMarker = 0
    } else if (inGroup) {
      currentGroup.push(columns)

      if (hasEndMarker) {
        rowsAfterEndMarker = 1
      } else if (rowsAfterEndMarker > 0) {
        rowsAfterEndMarker++
        if (rowsAfterEndMarker > BUFFER_ROWS) {
          groups.push(currentGroup)
          currentGroup = []
          inGroup = false
          rowsAfterEndMarker = 0
        }
      }
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  console.log('\n=== GROUPED TRANSACTIONS ===')
  console.log(`Found ${groups.length} transaction(s)`)
  groups.forEach((group, index) => {
    console.log(`\n--- Transaction ${index + 1} ---`)
    group.forEach((row, rowIndex) => {
      console.log(`  [${rowIndex}]`, row)
    })
  })

  return groups
}

const parseTransactionGroups = (groups: string[][][]): Transaction[] => {
  return groups.map((rawRows, index) => {
    // Placeholder parsing - will be implemented based on actual Bank Jago format
    const allText = rawRows.flat().join(' ')

    return {
      id: `txn-${index}`,
      date: new Date(),
      description: allText.substring(0, 50),
      amount: 0,
      balance: 0,
      type: 'debit' as const,
      rawRows,
    }
  })
}

const parsePageSelector = (selector: string, totalPages: number): number[] => {
  // Handle 'all' keyword
  if (selector.toLowerCase().trim() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  // Parse ranges like '1-5', '1,3-5', '1,3,5-7'
  const parsed = parseNumericRange(selector)

  if (!parsed || parsed.length === 0) {
    throw new Error(`Invalid page selector: ${selector}`)
  }

  // Separate valid and out-of-bounds pages
  const validPages: number[] = []
  const skippedPages: number[] = []

  parsed.forEach(page => {
    if (page >= 1 && page <= totalPages) {
      validPages.push(page)
    } else {
      skippedPages.push(page)
    }
  })

  // Warn about out-of-bounds pages
  if (skippedPages.length > 0) {
    console.warn(
      `[WARNING] PDF has ${totalPages} page(s). Skipping out-of-bounds pages: ${skippedPages.join(', ')}`
    )
  }

  if (validPages.length === 0) {
    throw new Error(
      `No valid pages to process. PDF has ${totalPages} page(s), but selector "${selector}" produced no valid pages.`
    )
  }

  return validPages
}

export interface ProcessResult {
  transactions: Transaction[]
  totalPages: number
}

export const processPDF = async (
  file: File,
  config: ParseConfig
): Promise<ProcessResult> => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  console.log('=== PDF INFO ===')
  console.log('Total pages:', pdf.numPages)

  // Parse page selector
  const pageNumbers = parsePageSelector(config.pageSelector, pdf.numPages)
  console.log(`Processing pages: ${pageNumbers.join(', ')}`)

  const allTransactions: Transaction[] = []

  for (const pageNumber of pageNumbers) {
    console.log(`\n=== PROCESSING PAGE ${pageNumber} ===`)

    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()

    // Functional pipeline
    const transactions = [textContent]
      .map(extractTextItems)
      .map(groupIntoLines)
      .map(createFilterRows(config))
      .map(groupIntoTransactions)
      .map(parseTransactionGroups)
      [0]

    allTransactions.push(...transactions)
  }

  console.log('\n=== PARSED TRANSACTIONS ===')
  console.log(`Successfully parsed ${allTransactions.length} transaction(s) from ${pageNumbers.length} page(s)`)
  console.log('\n=== END OF PDF TEXT ===')

  return {
    transactions: allTransactions,
    totalPages: pdf.numPages,
  }
}
