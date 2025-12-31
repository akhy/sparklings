export const translations = {
  // Header
  title: {
    id: 'Jago',
    en: 'Jago'
  },
  subtitle: {
    id: 'Ekstrak data transaksi Bank Jago dari laporan PDF ke format CSV',
    en: 'Extract your Bank Jago transaction data from PDF statements into CSV format'
  },

  // File Upload
  choosePdfFile: {
    id: 'Pilih File PDF',
    en: 'Choose PDF File'
  },
  page: {
    id: 'halaman',
    en: 'page'
  },
  pages: {
    id: 'halaman',
    en: 'pages'
  },
  showConfiguration: {
    id: 'Tampilkan Konfigurasi',
    en: 'Show Configuration'
  },
  loadingPdf: {
    id: 'Memuat PDF...',
    en: 'Loading PDF...'
  },
  errorInvalidPdf: {
    id: 'Silakan pilih file PDF yang valid',
    en: 'Please select a valid PDF file'
  },
  errorFailedToLoad: {
    id: 'Gagal memuat PDF:',
    en: 'Failed to load PDF:'
  },

  // Configuration Panel
  configurationTitle: {
    id: 'Konfigurasi',
    en: 'Configuration'
  },
  monthHeaderLocale: {
    id: 'Locale Header Bulan',
    en: 'Month Header Locale'
  },
  monthHeaderLocaleNone: {
    id: 'Tidak ada (Tanpa filter)',
    en: 'None (No filtering)'
  },
  monthHeaderLocaleEnglish: {
    id: 'Bahasa Inggris',
    en: 'English'
  },
  monthHeaderLocaleIndonesian: {
    id: 'Bahasa Indonesia',
    en: 'Indonesian'
  },
  monthHeaderLocaleHelp: {
    id: 'Filter header bagian bulan',
    en: 'Filter out month section headers'
  },
  pageSelector: {
    id: 'Pemilih Halaman',
    en: 'Page Selector'
  },
  pageSelectorPlaceholder: {
    id: 'all, 1-5, 1,3-5',
    en: 'all, 1-5, 1,3-5'
  },
  pageSelectorHelp: {
    id: 'mis., \'all\', \'1-5\', \'1,3-5\'',
    en: 'e.g., \'all\', \'1-5\', \'1,3-5\''
  },
  timezone: {
    id: 'Zona Waktu',
    en: 'Timezone'
  },
  timezoneHelp: {
    id: 'Offset zona waktu lokal',
    en: 'Local timezone offset'
  },
  yTolerance: {
    id: 'Toleransi Y (px)',
    en: 'Y Tolerance (px)'
  },
  yToleranceHelp: {
    id: 'Untuk mengelompokkan teks ke baris yang sama',
    en: 'For grouping text into same line'
  },
  xTolerance: {
    id: 'Toleransi X (px)',
    en: 'X Tolerance (px)'
  },
  xToleranceHelp: {
    id: 'Untuk menggabungkan teks yang terpotong',
    en: 'For merging wrapped text'
  },
  skipRowPatterns: {
    id: 'Baris yang Dilewati',
    en: 'Skip Row Patterns'
  },
  skipRowPatternsHelp: {
    id: 'Satu regex per baris',
    en: 'One regex per line'
  },
  resetToDefault: {
    id: 'Atur Ulang ke Default',
    en: 'Reset to Default'
  },
  reparseWithConfig: {
    id: 'Parsing Ulang',
    en: 'Re-parse'
  },

  // Statistics
  statisticsTitle: {
    id: 'Statistik',
    en: 'Statistics'
  },
  totalTransactions: {
    id: 'Total Transaksi',
    en: 'Total Transactions'
  },
  totalDebits: {
    id: 'Total Debit',
    en: 'Total Debits'
  },
  totalCredits: {
    id: 'Total Kredit',
    en: 'Total Credits'
  },

  // Transactions Table
  searchPlaceholder: {
    id: 'Cari transaksi...',
    en: 'Search transactions...'
  },
  showingCount: {
    id: 'Menampilkan',
    en: 'Showing'
  },
  of: {
    id: 'dari',
    en: 'of'
  },
  exportCsv: {
    id: 'Ekspor CSV',
    en: 'Export CSV'
  },
  tableHeaderTimestamp: {
    id: 'Waktu',
    en: 'Timestamp'
  },
  tableHeaderDescription: {
    id: 'Deskripsi',
    en: 'Description'
  },
  tableHeaderNote: {
    id: 'Catatan',
    en: 'Note'
  },
  tableHeaderType: {
    id: 'Jenis',
    en: 'Type'
  },
  tableHeaderAmount: {
    id: 'Jumlah',
    en: 'Amount'
  },
  tableHeaderBalance: {
    id: 'Saldo',
    en: 'Balance'
  },

  // Privacy Warnings
  privacyWarningTitle: {
    id: 'Peringatan Privasi',
    en: 'Privacy Warning'
  },
  privacyWarningFirstLaunch: {
    id: '⚠️ Data Anda bersifat pribadi - jangan bagikan screenshot hasil parsing tanpa menyembunyikan informasi sensitif',
    en: '⚠️ Your data is private - don\'t share parsing result screenshots without hiding sensitive information'
  },
  privacyWarningPersistent: {
    id: '💡 Hati-hati saat membagikan screenshot - data transaksi bersifat pribadi',
    en: '💡 Be careful when sharing screenshots - transaction data is private'
  },
  privacyWarningDismiss: {
    id: 'Mengerti',
    en: 'Got it'
  },
  privacyWarningDontShowAgain: {
    id: 'Jangan tampilkan lagi',
    en: 'Don\'t show again'
  },

  // Footer
  disclaimer: {
    id: 'Disclaimer: Alat ini tidak berafiliasi dengan PT Bank Jago Tbk dengan cara apa pun. Pembuat tidak bertanggung jawab atas masalah apa pun yang timbul dari penggunaan alat ini.',
    en: 'Disclaimer: This tool is not affiliated with PT Bank Jago Tbk in any way. The author holds no responsibility for any issues arising from the use of this tool.'
  },
  offlineMessage: {
    id: 'Bekerja sepenuhnya offline. Data Anda tidak pernah meninggalkan perangkat Anda.',
    en: 'Works completely offline. Your data never leaves your device.'
  }
} as const
