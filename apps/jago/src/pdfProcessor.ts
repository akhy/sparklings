import * as pdfjsLib from 'pdfjs-dist'
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api'
import parseNumericRange from 'parse-numeric-range'
import type { ParseConfig } from './config'
import { DEFAULT_CONFIG } from './config'

// PDF.js text content types
interface TextContent {
  items: Array<TextItem | TextMarkedContent>
  styles: Record<string, unknown>
}

// Type guard to check if item is TextItem (has transform property)
function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
  return 'transform' in item && 'str' in item
}

export interface Transaction {
  id: string
  timestamp: string // ISO 8601 with timezone (e.g., "2024-12-24T14:30:00+07:00")
  description: string
  note: string // extra note, sometimes from the user who make the transaction
  amount: number
  balance: number
  type: 'debit' | 'credit'
  index: number // Original index in the page for stable sorting
  rawData: string[][]
}

export type { ParseConfig }
export { DEFAULT_CONFIG }

// Debug/Development toggles
const REMOVE_EMPTY_CELLS = false

// Shared patterns for critical transaction fields
const PATTERNS = {
  date: /^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/,
  time: /^\d{2}:\d{2}$/,
  amount: /^[+-][\d.,]+$/,  // Has sign
  balance: /^[\d.,]+$/,     // No sign
  id: /^ID#\s*(.+)$/,
} as const

// Internal types for preserving X-coordinates through the pipeline
interface CellWithPosition {
  x: number
  str: string
}
type RowWithPositions = CellWithPosition[]
type LinesWithPositions = RowWithPositions[]

// Processing pipeline functions
const extractTextItems = (textContent: TextContent): TextItem[] => {
  console.log('\n=== RAW TEXT ITEMS (with positions) ===')
  const textItems = textContent.items.filter(isTextItem)
  textItems.forEach((item, index) => {
    console.log(`[${index}] x:${item.transform[4].toFixed(1)} y:${item.transform[5].toFixed(1)} "${item.str}"`)
  })
  return textItems
}

const createGroupIntoLines = (yTolerance: number) => (items: TextItem[]): LinesWithPositions => {
  // Sort items by Y-coordinate (top to bottom)
  const sortedItems = items
    .map((item) => ({
      x: item.transform[4],
      y: item.transform[5],
      str: item.str
    }))
    .sort((a, b) => b.y - a.y) // Higher Y = top of page

  // Group items into lines using Y-tolerance
  const lines: Array<Array<{ x: number; y: number; str: string }>> = []

  sortedItems.forEach(item => {
    // Find a line with similar Y-coordinate
    const matchingLine = lines.find(line => {
      const lineY = line[0].y
      return Math.abs(item.y - lineY) <= yTolerance
    })

    if (matchingLine) {
      matchingLine.push({ x: item.x, y: item.y, str: item.str })
    } else {
      // Create new line
      lines.push([{ x: item.x, y: item.y, str: item.str }])
    }
  })

  // Sort each line by X-coordinate (left to right) and preserve X-coordinates
  const sortedLines: LinesWithPositions = lines.map(line => {
    const sorted = line.sort((a, b) => a.x - b.x)

    const withPositions: RowWithPositions = sorted.map(item => ({ x: item.x, str: item.str }))

    return REMOVE_EMPTY_CELLS
      ? withPositions.filter(cell => cell.str.trim() !== '')
      : withPositions
  })

  console.log('\n=== LINES AS 2D ARRAY (columns preserved) ===')
  sortedLines.forEach((columns, index) => {
    const strings = columns.map(c => c.str)
    console.log(`[${index}]`, strings)
  })

  return sortedLines
}

const createFilterRows = (config: ParseConfig) => (lines: LinesWithPositions): LinesWithPositions => {
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
    const rowText = columns.map(c => c.str).join(' ').trim()

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

const groupIntoTransactions = (lines: LinesWithPositions): Array<LinesWithPositions> => {
  const datePattern = /^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/
  const groups: Array<LinesWithPositions> = []
  let currentGroup: LinesWithPositions = []

  for (const columns of lines) {
    const hasDateMarker = columns.some(cell => datePattern.test(cell.str.trim()))

    if (hasDateMarker) {
      // Date marker starts a new transaction
      // Push previous transaction if it exists
      if (currentGroup.length > 0) {
        groups.push(currentGroup)
      }
      // Start new transaction with this row
      currentGroup = [columns]
    } else if (currentGroup.length > 0) {
      // Continue adding rows to current transaction
      currentGroup.push(columns)
    }
    // else: no current transaction and no date marker, skip this row
  }

  // Push the last transaction
  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  console.log('\n=== GROUPED TRANSACTIONS ===')
  console.log(`Found ${groups.length} transaction(s)`)
  groups.forEach((group, index) => {
    console.log(`\n--- Transaction ${index + 1} ---`)
    group.forEach((row, rowIndex) => {
      const strings = row.map(c => c.str)
      console.log(`  [${rowIndex}]`, strings)
    })
  })

  return groups
}

const mergeWrappedText = (xTolerance: number) => (groups: Array<LinesWithPositions>): string[][][] => {
  const isCriticalField = (str: string): boolean => {
    const trimmed = str.trim()
    return (
      PATTERNS.date.test(trimmed) ||
      PATTERNS.time.test(trimmed) ||
      PATTERNS.amount.test(trimmed) ||
      PATTERNS.balance.test(trimmed) ||
      PATTERNS.id.test(trimmed)
    )
  }

  return groups.map(transactionGroup => {
    if (transactionGroup.length === 0) return []

    // Build merged rows
    const mergedRows: RowWithPositions[] = []

    for (let rowIdx = 0; rowIdx < transactionGroup.length; rowIdx++) {
      const currentRow = transactionGroup[rowIdx]

      if (rowIdx === 0) {
        // First row becomes the base
        mergedRows.push([...currentRow])
      } else {
        // For continuation rows, try to merge cells into existing rows
        for (const cell of currentRow) {
          // Skip empty cells
          if (cell.str.trim() === '') continue

          // Don't merge critical fields - add them as a new row instead
          if (isCriticalField(cell.str)) {
            // Find if we already have a row for this continuation
            // For simplicity, create a new row for critical fields in continuation
            const existingContinuationRow = mergedRows[rowIdx]
            if (existingContinuationRow) {
              existingContinuationRow.push(cell)
            } else {
              mergedRows[rowIdx] = [cell]
            }
            continue
          }

          // Find the closest cell in the first row (base row) by X-coordinate
          let closestCellIdx = 0
          let minDistance = Math.abs(mergedRows[0][0].x - cell.x)

          for (let i = 0; i < mergedRows[0].length; i++) {
            const distance = Math.abs(mergedRows[0][i].x - cell.x)
            if (distance < minDistance) {
              minDistance = distance
              closestCellIdx = i
            }
          }

          // Merge if within tolerance
          if (minDistance <= xTolerance) {
            mergedRows[0][closestCellIdx].str += '\n' + cell.str
          } else {
            // Too far from any column, preserve as new cell
            mergedRows[0].push(cell)
          }
        }
      }
    }

    // Convert RowWithPositions[] to string[][] for backward compatibility
    const stringRows = mergedRows.map(row => row.map(cell => cell.str))

    return stringRows
  })
}

const parseTransactionGroups = (groups: string[][][], timezone: string): Transaction[] => {
  return groups.map((rawData, index) => {
    // Flatten all rows into a single array of cells for ID/date/time extraction
    const allCells = rawData.flat()

    // Create a working array (we'll remove matched items)
    const remaining = [...allCells]

    // Extract ID using shared pattern
    let id = `txn-${index}`
    const idIndex = remaining.findIndex(cell => PATTERNS.id.test(cell.trim()))
    if (idIndex !== -1) {
      const match = remaining[idIndex].trim().match(PATTERNS.id)
      if (match) {
        id = match[1].trim()
        remaining.splice(idIndex, 1) // Remove from array
      }
    }

    // Extract Date using shared pattern
    let dateStr = ''
    const dateIndex = remaining.findIndex(cell => PATTERNS.date.test(cell.trim()))
    if (dateIndex !== -1) {
      dateStr = remaining[dateIndex].trim()
      remaining.splice(dateIndex, 1) // Remove from array
    }

    // Extract Time using shared pattern
    let timeStr = ''
    const timeIndex = remaining.findIndex(cell => PATTERNS.time.test(cell.trim()))
    if (timeIndex !== -1) {
      timeStr = remaining[timeIndex].trim()
      remaining.splice(timeIndex, 1) // Remove from array
    }

    // Combine date and time into ISO 8601 timestamp
    let timestamp = ''
    if (dateStr && timeStr) {
      // Parse date: "14 Aug 2021" -> "2021-08-14"
      const months: {[key: string]: string} = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
        'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      }
      const [day, monthName, year] = dateStr.split(/\s+/)
      const month = months[monthName]
      if (month) {
        timestamp = `${year}-${month}-${day.padStart(2, '0')}T${timeStr}:00${timezone}`
      }
    }

    // Extract Amount and Balance (ONLY from first row - row [0]) using shared patterns
    // Indonesian locale: dot (.) = thousand separator, comma (,) = decimal separator
    // Amount always has a sign (+ or -), balance does not
    let amount = 0
    let balance = 0

    // Only search for amount/balance in the FIRST row (to avoid account numbers in later rows)
    if (rawData.length > 0) {
      const firstRow = rawData[0]

      // Find amount (has sign) using shared pattern
      const amountCandidate = firstRow.find(cell => PATTERNS.amount.test(cell.trim()))
      if (amountCandidate) {
        // Parse Indonesian number format: remove dots (thousands), replace comma with dot (decimal)
        amount = parseFloat(amountCandidate.trim().replace(/\./g, '').replace(',', '.'))

        // Remove from remaining array
        const amountGlobalIdx = remaining.indexOf(amountCandidate)
        if (amountGlobalIdx !== -1) remaining.splice(amountGlobalIdx, 1)
      }

      // Find balance (no sign, just numbers) using shared pattern
      const balanceCandidate = firstRow.find(cell => PATTERNS.balance.test(cell.trim()) && cell.trim() !== '')
      if (balanceCandidate) {
        balance = parseFloat(balanceCandidate.trim().replace(/\./g, '').replace(',', '.'))

        // Remove from remaining array
        const balanceGlobalIdx = remaining.indexOf(balanceCandidate)
        if (balanceGlobalIdx !== -1) remaining.splice(balanceGlobalIdx, 1)
      }
    }

    // Determine type based on amount sign
    const type: 'debit' | 'credit' = amount < 0 ? 'debit' : 'credit'

    // Join remaining non-empty cells as description
    const description = remaining
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0)
      .join('\n')

    return {
      id,
      timestamp,
      description,
      note: '', // Not distinguishing note for now, all in description
      amount,
      balance,
      type,
      index, // Original index for stable sorting
      rawData,
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
      .map(createGroupIntoLines(config.yTolerance))
      .map(createFilterRows(config))
      .map(groupIntoTransactions)
      .map(mergeWrappedText(config.xTolerance))
      .map(groups => parseTransactionGroups(groups, config.timezone))[0]

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
