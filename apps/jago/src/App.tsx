import { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { Transaction, ParseConfig, DEFAULT_CONFIG, processPDF } from './pdfProcessor'

// Configure PDF.js worker (use npm package worker for offline support)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [config, setConfig] = useState<ParseConfig>(DEFAULT_CONFIG)
  const [showConfig, setShowConfig] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<keyof Transaction>('timestamp')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterText, setFilterText] = useState('')
  const [totalPages, setTotalPages] = useState<number | null>(null)
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
      const result = await processPDF(file, config)
      setTransactions(result.transactions)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError('Failed to load PDF: ' + (err as Error).message)
    } finally {
      setLoading(false)
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
        t.note.toLowerCase().includes(search) ||
        t.timestamp.toLowerCase().includes(search) ||
        t.amount.toString().includes(search)
      )
    })
    .sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      const direction = sortDirection === 'asc' ? 1 : -1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * direction
      }

      // ISO 8601 timestamps sort correctly as strings
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
                {file.name} ({Math.round(file.size / 1024)} KB
                {totalPages !== null && `, ${totalPages} page${totalPages !== 1 ? 's' : ''}`})
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month Header Locale
                </label>
                <select
                  value={config.monthHeaderLocale || 'none'}
                  onChange={(e) =>
                    setConfig({ ...config, monthHeaderLocale: e.target.value === 'none' ? null : e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="none">None (No filtering)</option>
                  <option value="en">English</option>
                  <option value="id">Indonesian</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Selector
                </label>
                <input
                  type="text"
                  value={config.pageSelector}
                  onChange={(e) =>
                    setConfig({ ...config, pageSelector: e.target.value })
                  }
                  placeholder="all, 1-5, 1,3-5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <input
                  type="text"
                  value={config.timezone}
                  onChange={(e) =>
                    setConfig({ ...config, timezone: e.target.value })
                  }
                  placeholder="+07:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skip Row Patterns (one regex per line)
              </label>
              <textarea
                value={config.skipRowPatterns.join('\n')}
                onChange={(e) =>
                  setConfig({ ...config, skipRowPatterns: e.target.value.split('\n').filter(p => p.trim()) })
                }
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setConfig(DEFAULT_CONFIG)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Reset to Default
              </button>
              <button
                onClick={() => file && loadPDF(file)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                disabled={!file}
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
                      onClick={() => handleSort('timestamp')}
                      className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Timestamp {sortBy === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('description')}
                      className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Description {sortBy === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('note')}
                      className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Note {sortBy === 'note' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                  {filteredTransactions.map((transaction) => {
                    // Parse ISO 8601 timestamp for display
                    const date = transaction.timestamp ? new Date(transaction.timestamp) : null
                    const formattedTimestamp = date
                      ? date.toLocaleString('id-ID', {
                          timeZone: 'Asia/Jakarta',
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })
                      : ''

                    return (
                      <tr
                        key={transaction.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm">
                          {formattedTimestamp}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            {transaction.description.split('\n').map((line, idx) => (
                              <div key={idx}>{line}</div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{transaction.note}</td>
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
                    )
                  })}
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
