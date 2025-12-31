import { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { Attribution } from '@sparklings/ui'
import { useLanguage, LanguageSwitcher } from '@sparklings/i18n'
import { Transaction, ParseConfig, DEFAULT_CONFIG, processPDF } from './pdfProcessor'
import { translations } from './i18n'

// Configure PDF.js worker (use npm package worker for offline support)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

function App() {
  const { language, setLanguage, t } = useLanguage(translations, {
    storageKey: 'jago-language'
  })
  const [file, setFile] = useState<File | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [config, setConfig] = useState<ParseConfig>(DEFAULT_CONFIG)
  const [showConfig, setShowConfig] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<keyof Transaction>('timestamp')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterText, setFilterText] = useState('')
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false)
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

  // Check if privacy warning should be shown
  useEffect(() => {
    const dismissed = localStorage.getItem('jago-privacy-warning-dismissed')
    if (!dismissed) {
      setShowPrivacyWarning(true)
    }
  }, [])

  const handleDismissPrivacyWarning = (dontShowAgain: boolean) => {
    setShowPrivacyWarning(false)
    if (dontShowAgain) {
      localStorage.setItem('jago-privacy-warning-dismissed', 'true')
    }
  }

  const loadPDF = async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const result = await processPDF(file, config)
      setTransactions(result.transactions)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(t('errorFailedToLoad') + ' ' + (err as Error).message)
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
      setError(t('errorInvalidPdf'))
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

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return

    // CSV headers
    const headers = ['Timestamp', 'ID', 'Type', 'Amount', 'Balance', 'Description', 'Note']

    // Convert transactions to CSV rows
    // Note: filteredTransactions is already sorted according to current sort settings
    const rows = filteredTransactions.map(t => [
      t.timestamp,
      t.id,
      t.type,
      t.amount.toString(),
      t.balance.toString(),
      // Properly escape for CSV: quote fields and escape internal quotes
      // Newlines are preserved inside quoted fields (standard CSV format per RFC 4180)
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.note.replace(/"/g, '""')}"`,
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    // Generate filename from original PDF name
    const csvFilename = file
      ? file.name.replace(/\.pdf$/i, '.csv')
      : 'transactions.csv'

    link.setAttribute('href', url)
    link.setAttribute('download', csvFilename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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

      let result = 0

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        result = (aVal - bVal) * direction
      } else {
        // ISO 8601 timestamps sort correctly as strings
        result = String(aVal).localeCompare(String(bVal)) * direction
      }

      // Use index as tiebreaker for stable sorting (respects sort direction)
      if (result === 0) {
        return (a.index - b.index) * direction
      }

      return result
    })

  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Privacy Warning Modal */}
      {showPrivacyWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{t('privacyWarningTitle')}</h2>
            <p className="text-gray-700 mb-6">{t('privacyWarningFirstLaunch')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDismissPrivacyWarning(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                {t('privacyWarningDismiss')}
              </button>
              <button
                onClick={() => handleDismissPrivacyWarning(true)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {t('privacyWarningDontShowAgain')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-2">
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800 font-stretch-50%">
          <img src="/android-chrome-192x192.png" alt="Jago Logo" className="inline-block w-10 h-10 mr-2 align-middle rounded-2xl" />
          {t('title')}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {t('subtitle')}
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
              {t('choosePdfFile')}
            </button>
            {file && (
              <span className="text-gray-700">
                {file.name} ({Math.round(file.size / 1024)} KB
                {totalPages !== null && `, ${totalPages} ${totalPages !== 1 ? t('pages') : t('page')}`})
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
              {t('showConfiguration')}
            </label>
          </div>

          {loading && (
            <div className="mt-4 text-blue-600">{t('loadingPdf')}</div>
          )}
          {error && (
            <div className="mt-4 text-red-600">{error}</div>
          )}
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">{t('configurationTitle')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('monthHeaderLocale')}
                </label>
                <select
                  value={config.monthHeaderLocale || 'none'}
                  onChange={(e) =>
                    setConfig({ ...config, monthHeaderLocale: e.target.value === 'none' ? null : e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="none">{t('monthHeaderLocaleNone')}</option>
                  <option value="en">{t('monthHeaderLocaleEnglish')}</option>
                  <option value="id">{t('monthHeaderLocaleIndonesian')}</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">{t('monthHeaderLocaleHelp')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pageSelector')}
                </label>
                <input
                  type="text"
                  value={config.pageSelector}
                  onChange={(e) =>
                    setConfig({ ...config, pageSelector: e.target.value })
                  }
                  placeholder={t('pageSelectorPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">{t('pageSelectorHelp')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('timezone')}
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
                <p className="mt-1 text-xs text-gray-500">{t('timezoneHelp')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('yTolerance')}
                </label>
                <input
                  type="number"
                  value={config.yTolerance}
                  onChange={(e) =>
                    setConfig({ ...config, yTolerance: parseFloat(e.target.value) || 10 })
                  }
                  placeholder="10"
                  min="0"
                  max="20"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">{t('yToleranceHelp')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('xTolerance')}
                </label>
                <input
                  type="number"
                  value={config.xTolerance}
                  onChange={(e) =>
                    setConfig({ ...config, xTolerance: parseFloat(e.target.value) || 5 })
                  }
                  placeholder="5"
                  min="0"
                  max="20"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">{t('xToleranceHelp')}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('skipRowPatterns')}
              </label>
              <textarea
                value={config.skipRowPatterns.join('\n')}
                onChange={(e) =>
                  setConfig({ ...config, skipRowPatterns: e.target.value.split('\n').filter(p => p.trim()) })
                }
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">{t('skipRowPatternsHelp')}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setConfig(DEFAULT_CONFIG)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                {t('resetToDefault')}
              </button>
              <button
                onClick={() => file && loadPDF(file)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                disabled={!file}
              >
                {t('reparseWithConfig')}
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">{t('statisticsTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-gray-600 text-sm">{t('totalTransactions')}</div>
                <div className="text-2xl font-bold">{transactions.length}</div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">{t('totalDebits')}</div>
                <div className="text-2xl font-bold text-red-600">
                  -Rp {totalDebits.toLocaleString('id-ID')}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">{t('totalCredits')}</div>
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
            {/* Persistent Privacy Warning */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              {t('privacyWarningPersistent')}
            </div>

            <div className="mb-4 flex items-center gap-4">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
              />
              <span className="text-gray-600 text-sm whitespace-nowrap">
                {t('showingCount')} {filteredTransactions.length} {t('of')} {transactions.length}
              </span>
              <button
                onClick={exportToCSV}
                disabled={filteredTransactions.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {t('exportCsv')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th
                      onClick={() => handleSort('timestamp')}
                      className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      {t('tableHeaderTimestamp')} {sortBy === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('description')}
                      className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      {t('tableHeaderDescription')} {sortBy === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('note')}
                      className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      {t('tableHeaderNote')} {sortBy === 'note' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('type')}
                      className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      {t('tableHeaderType')} {sortBy === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('amount')}
                      className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      {t('tableHeaderAmount')} {sortBy === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('balance')}
                      className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      {t('tableHeaderBalance')} {sortBy === 'balance' && (sortDirection === 'asc' ? '↑' : '↓')}
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

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-gray-500 space-y-2">
          <p className="text-gray-400">
            {t('disclaimer')}
          </p>

          <p>
            {t('offlineMessage')}
          </p>

          <p>
            <Attribution appName="jago" />
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
