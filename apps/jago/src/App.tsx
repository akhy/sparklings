import { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker (use npm package worker for offline support)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface Transaction {
  id: string
  date: Date
  description: string
  amount: number
  balance: number
  type: 'debit' | 'credit'
  rawText?: string
}

interface ParseConfig {
  dateColumn: number
  descriptionColumn: number
  amountColumn: number
  balanceColumn: number
  skipLinesFromTop: number
  skipLinesFromBottom: number
  transactionPattern: string
  excludeKeywords: string[]
  includeKeywords: string[]
  dateFormat: string
  monthHeaderLocale: string | null
  skipRowPatterns: string[]
}

const DEFAULT_CONFIG: ParseConfig = {
  dateColumn: 0,
  descriptionColumn: 12,
  amountColumn: 60,
  balanceColumn: 75,
  skipLinesFromTop: 10,
  skipLinesFromBottom: 5,
  transactionPattern: '\\d{2}/\\d{2}/\\d{4}',
  excludeKeywords: ['SALDO AWAL', 'TOTAL'],
  includeKeywords: [],
  dateFormat: 'DD/MM/YYYY',
  monthHeaderLocale: 'en',
  skipRowPatterns: [
    'Page \\d+ of \\d+',
    'also a member of Indonesia Deposit Insurance Corporation',
    'PT Bank Jago Tbk is licensed',
    'www\\.jago\\.com',
  ],
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfText, setPdfText] = useState<string>('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [config, setConfig] = useState<ParseConfig>(DEFAULT_CONFIG)
  const [showConfig, setShowConfig] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<keyof Transaction>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterText, setFilterText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jago-parse-config')
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load config:', e)
      }
    }
  }, [])

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem('jago-parse-config', JSON.stringify(config))
  }, [config])

  const loadPDF = async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      // Only load first page for debugging
      console.log('=== PDF INFO ===')
      console.log('Total pages:', pdf.numPages)
      console.log('Loading page 1 only...')

      const page = await pdf.getPage(1)
      const textContent = await page.getTextContent()

      // Log raw items with positions
      console.log('\n=== RAW TEXT ITEMS (with positions) ===')
      textContent.items.forEach((item: any, index: number) => {
        console.log(`[${index}] x:${item.transform[4].toFixed(1)} y:${item.transform[5].toFixed(1)} "${item.str}"`)
      })

      // Simple space-joined text
      const simpleText = textContent.items
        .map((item: any) => item.str)
        .join(' ')

      console.log('\n=== SIMPLE TEXT (space-joined) ===')
      console.log(simpleText)

      // Line-based text (preserve vertical positioning)
      const lines: { [key: number]: string[] } = {}
      textContent.items.forEach((item: any) => {
        const y = Math.round(item.transform[5])
        if (!lines[y]) lines[y] = []
        lines[y].push(item.str)
      })

      const sortedLines = Object.keys(lines)
        .sort((a, b) => parseInt(b) - parseInt(a)) // Top to bottom
        .map(y => lines[parseInt(y)])

      console.log('\n=== LINES AS 2D ARRAY (columns preserved) ===')
      sortedLines.forEach((columns, index) => {
        console.log(`[${index}]`, columns)
      })

      // Pre-process: filter out unwanted rows
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

      const filteredLines = sortedLines.filter((columns) => {
        const rowText = columns.join(' ').trim()

        // Skip month headers if locale is configured
        if (monthHeaderPattern && monthHeaderPattern.test(rowText)) {
          console.log(`[SKIP] Month header: "${rowText}"`)
          return false
        }

        // Skip rows matching any skip patterns
        for (const pattern of skipRowPatterns) {
          if (pattern.test(rowText)) {
            console.log(`[SKIP] Pattern match: "${rowText}"`)
            return false
          }
        }

        return true
      })

      console.log(`\n=== FILTERED ${sortedLines.length - filteredLines.length} row(s) ===`)

      // Group rows into transactions
      // Start: cell with date format '03 Nov 2021'
      // End: cell starting with 'ID#' + buffer rows
      const datePattern = /^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/
      const groupedTransactions: string[][][] = []
      let currentGroup: string[][] = []
      let inGroup = false
      let rowsAfterEndMarker = 0
      const BUFFER_ROWS = 3 // Include 3 more rows after ID# to catch trailing content

      for (let i = 0; i < filteredLines.length; i++) {
        const columns = filteredLines[i]

        // Check if any cell matches date pattern (start marker)
        const hasDateMarker = columns.some(cell => datePattern.test(cell.trim()))

        // Check if any cell starts with 'ID#' (end marker)
        const hasEndMarker = columns.some(cell => cell.trim().startsWith('ID#'))

        if (hasDateMarker) {
          // Start new group
          if (currentGroup.length > 0) {
            groupedTransactions.push(currentGroup)
          }
          currentGroup = [columns]
          inGroup = true
          rowsAfterEndMarker = 0
        } else if (inGroup) {
          currentGroup.push(columns)

          if (hasEndMarker) {
            // Mark end but continue for buffer rows
            rowsAfterEndMarker = 1
          } else if (rowsAfterEndMarker > 0) {
            rowsAfterEndMarker++
            if (rowsAfterEndMarker > BUFFER_ROWS) {
              // End current group after buffer
              groupedTransactions.push(currentGroup)
              currentGroup = []
              inGroup = false
              rowsAfterEndMarker = 0
            }
          }
        }
      }

      // Add last group if exists
      if (currentGroup.length > 0) {
        groupedTransactions.push(currentGroup)
      }

      console.log('\n=== GROUPED TRANSACTIONS ===')
      console.log(`Found ${groupedTransactions.length} transaction(s)`)
      groupedTransactions.forEach((group, index) => {
        console.log(`\n--- Transaction ${index + 1} ---`)
        group.forEach((row, rowIndex) => {
          console.log(`  [${rowIndex}]`, row)
        })
      })

      const lineBasedText = sortedLines.map(cols => cols.join(' ')).join('\n')

      console.log('\n=== END OF PDF TEXT ===')

      setPdfText(lineBasedText)
      parseTransactions(lineBasedText)
    } catch (err) {
      setError('Failed to load PDF: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const parseTransactions = (text: string) => {
    try {
      const lines = text.split('\n')
      const validLines = lines.slice(
        config.skipLinesFromTop,
        lines.length - config.skipLinesFromBottom
      )

      const pattern = new RegExp(config.transactionPattern)
      const parsed: Transaction[] = []

      for (const line of validLines) {
        // Skip if doesn't match pattern
        if (!pattern.test(line)) continue

        // Skip if contains exclude keywords
        if (config.excludeKeywords.some(kw => line.includes(kw))) continue

        // Skip if include keywords specified and line doesn't contain any
        if (
          config.includeKeywords.length > 0 &&
          !config.includeKeywords.some(kw => line.includes(kw))
        ) continue

        try {
          // Extract columns based on positions
          const dateStr = line.substring(config.dateColumn, config.dateColumn + 10).trim()
          const description = line
            .substring(config.descriptionColumn, config.amountColumn)
            .trim()
          const amountStr = line
            .substring(config.amountColumn, config.balanceColumn)
            .trim()
          const balanceStr = line.substring(config.balanceColumn).trim()

          // Parse date
          const dateParts = dateStr.split('/')
          if (dateParts.length !== 3) continue
          const date = new Date(
            parseInt(dateParts[2]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[0])
          )

          // Parse amount (handle different formats)
          const amount = parseFloat(
            amountStr
              .replace(/[^\d.,-]/g, '')
              .replace(',', '.')
          )
          if (isNaN(amount)) continue

          // Parse balance
          const balance = parseFloat(
            balanceStr
              .replace(/[^\d.,-]/g, '')
              .replace(',', '.')
          )

          parsed.push({
            id: `${date.getTime()}-${parsed.length}`,
            date,
            description,
            amount: amountStr.includes('-') ? -Math.abs(amount) : amount,
            balance: isNaN(balance) ? 0 : balance,
            type: amountStr.includes('-') || amount < 0 ? 'debit' : 'credit',
            rawText: line,
          })
        } catch (err) {
          console.warn('Failed to parse line:', line, err)
        }
      }

      setTransactions(parsed)
      if (parsed.length === 0) {
        setError('No transactions found. Try adjusting the configuration.')
      }
    } catch (err) {
      setError('Failed to parse transactions: ' + (err as Error).message)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      loadPDF(selectedFile)
    } else {
      setError('Please select a valid PDF file')
    }
  }

  const handleSort = (column: keyof Transaction) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  const filteredTransactions = transactions
    .filter(t => {
      if (!filterText) return true
      const search = filterText.toLowerCase()
      return (
        t.description.toLowerCase().includes(search) ||
        t.date.toLocaleDateString().includes(search) ||
        t.amount.toString().includes(search)
      )
    })
    .sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      const direction = sortDirection === 'asc' ? 1 : -1

      if (aVal instanceof Date && bVal instanceof Date) {
        return (aVal.getTime() - bVal.getTime()) * direction
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * direction
      }

      return String(aVal).localeCompare(String(bVal)) * direction
    })

  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
          Jago
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Bank Jago Statement Parser
        </p>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium shadow-md"
            >
              Choose PDF File
            </button>
            {file && (
              <span className="text-gray-700">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="showConfig"
              checked={showConfig}
              onChange={(e) => setShowConfig(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="showConfig" className="text-gray-700 cursor-pointer">
              Show Configuration
            </label>
          </div>

          {loading && (
            <div className="mt-4 text-blue-600">Loading PDF...</div>
          )}
          {error && (
            <div className="mt-4 text-red-600">{error}</div>
          )}
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Column
                </label>
                <input
                  type="number"
                  value={config.dateColumn}
                  onChange={(e) =>
                    setConfig({ ...config, dateColumn: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description Column
                </label>
                <input
                  type="number"
                  value={config.descriptionColumn}
                  onChange={(e) =>
                    setConfig({ ...config, descriptionColumn: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Column
                </label>
                <input
                  type="number"
                  value={config.amountColumn}
                  onChange={(e) =>
                    setConfig({ ...config, amountColumn: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Balance Column
                </label>
                <input
                  type="number"
                  value={config.balanceColumn}
                  onChange={(e) =>
                    setConfig({ ...config, balanceColumn: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skip Lines (Top)
                </label>
                <input
                  type="number"
                  value={config.skipLinesFromTop}
                  onChange={(e) =>
                    setConfig({ ...config, skipLinesFromTop: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skip Lines (Bottom)
                </label>
                <input
                  type="number"
                  value={config.skipLinesFromBottom}
                  onChange={(e) =>
                    setConfig({ ...config, skipLinesFromBottom: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Pattern (Regex)
                </label>
                <input
                  type="text"
                  value={config.transactionPattern}
                  onChange={(e) =>
                    setConfig({ ...config, transactionPattern: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setConfig(DEFAULT_CONFIG)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Reset to Default
              </button>
              <button
                onClick={() => pdfText && parseTransactions(pdfText)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Re-parse with Current Config
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-gray-600 text-sm">Total Transactions</div>
                <div className="text-2xl font-bold">{transactions.length}</div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Total Debits</div>
                <div className="text-2xl font-bold text-red-600">
                  -Rp {totalDebits.toLocaleString('id-ID')}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Total Credits</div>
                <div className="text-2xl font-bold text-green-600">
                  +Rp {totalCredits.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4 flex items-center gap-4">
              <input
                type="text"
                placeholder="Search transactions..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
              />
              <span className="text-gray-600 text-sm">
                Showing {filteredTransactions.length} of {transactions.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th
                      onClick={() => handleSort('date')}
                      className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('description')}
                      className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Description {sortBy === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('type')}
                      className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Type {sortBy === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('amount')}
                      className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Amount {sortBy === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('balance')}
                      className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Balance {sortBy === 'balance' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm">
                        {transaction.date.toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm">{transaction.description}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            transaction.type === 'debit'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-sm text-right font-medium ${
                          transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {transaction.type === 'debit' ? '-' : '+'}Rp{' '}
                        {Math.abs(transaction.amount).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        Rp {transaction.balance.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
