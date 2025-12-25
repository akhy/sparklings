export type Language = 'id' | 'en'

export const translations = {
  title: {
    id: 'NoKTP',
    en: 'NoKTP'
  },
  subtitle: {
    id: 'Pengurai Nomor Induk Kependudukan Indonesia',
    en: 'Indonesian NIK (KTP Number) Breakdown'
  },
  inputLabel: {
    id: 'Masukkan NIK (16 digit)',
    en: 'Enter NIK (16 digits)'
  },
  inputPlaceholder: {
    id: 'XXXXXX XXXXXX XXXX',
    en: 'XXXXXX XXXXXX XXXX'
  },
  validNik: {
    id: 'NIK Valid',
    en: 'Valid NIK'
  },
  invalidNik: {
    id: 'NIK Tidak Valid',
    en: 'Invalid NIK'
  },
  location: {
    id: 'Lokasi',
    en: 'Location'
  },
  province: {
    id: 'Provinsi',
    en: 'Province'
  },
  regency: {
    id: 'Kabupaten/Kota',
    en: 'Regency/City'
  },
  district: {
    id: 'Kecamatan',
    en: 'District'
  },
  birthInfo: {
    id: 'Informasi Lahir',
    en: 'Birth Information'
  },
  date: {
    id: 'Tanggal',
    en: 'Date'
  },
  month: {
    id: 'Bulan',
    en: 'Month'
  },
  year: {
    id: 'Tahun',
    en: 'Year'
  },
  gender: {
    id: 'Jenis Kelamin',
    en: 'Gender'
  },
  male: {
    id: '♂ Laki-laki',
    en: '♂ Male'
  },
  female: {
    id: '♀ Perempuan',
    en: '♀ Female'
  },
  femaleNote: {
    id: 'Tanggal lahir + 40 menunjukkan perempuan',
    en: 'Birth date + 40 indicates female'
  },
  serialNumber: {
    id: 'Nomor Seri',
    en: 'Serial Number'
  },
  serialNote: {
    id: 'Nomor registrasi unik',
    en: 'Unique registration number'
  },
  loadingLocation: {
    id: 'Memuat data lokasi...',
    en: 'Loading location data...'
  },
  unknown: {
    id: 'Tidak diketahui',
    en: 'Unknown'
  },
  visualBreakdown: {
    id: 'Visualisasi Rincian',
    en: 'Visual Breakdown'
  },
  aboutTitle: {
    id: 'Tentang NIK',
    en: 'About NIK'
  },
  aboutNik1: {
    id: 'NIK (Nomor Induk Kependudukan) adalah identifikasi unik 16 digit pada KTP Indonesia',
    en: 'NIK (Nomor Induk Kependudukan) is a 16-digit unique identifier on Indonesian KTP'
  },
  aboutNik2: {
    id: '6 digit pertama: Kode lokasi administratif (Provinsi, Kabupaten, Kecamatan)',
    en: 'First 6 digits: Administrative location code (Province, Regency, District)'
  },
  aboutNik3: {
    id: '6 digit selanjutnya: Tanggal lahir dalam format DDMMYY',
    en: 'Next 6 digits: Date of birth in DDMMYY format'
  },
  aboutNik4: {
    id: 'Untuk perempuan, 40 ditambahkan ke tanggal lahir (mis. 47 = tanggal 7, perempuan)',
    en: 'For females, 40 is added to the birth date (e.g., 47 = 7th day, female)'
  },
  aboutNik5: {
    id: '4 digit terakhir: Nomor seri registrasi unik',
    en: 'Last 4 digits: Unique serial registration number'
  },
  aboutNik6: {
    id: 'Nama lokasi diambil dari',
    en: 'Location names are fetched from'
  },
  disclaimer: {
    id: 'Alat ini hanya untuk tujuan edukasi. Penguraian NIK dilakukan secara lokal di browser Anda. Hanya kode lokasi (6 digit pertama) yang digunakan untuk mengambil nama lokasi dari API eksternal. NIK lengkap Anda tidak pernah dikirim atau disimpan.',
    en: 'This tool is for educational purposes only. NIK parsing happens locally in your browser. Only location codes (first 6 digits) are used to fetch location names from an external API. Your full NIK is never transmitted or stored.'
  },
  // Error messages
  errorLengthError: {
    id: 'NIK harus tepat 16 digit',
    en: 'NIK must be exactly 16 digits'
  },
  errorDigitsOnly: {
    id: 'NIK harus hanya berisi angka',
    en: 'NIK must contain only numbers'
  },
  errorInvalidDate: {
    id: 'Tanggal lahir tidak valid (tanggal harus 1-31)',
    en: 'Invalid birth date (day must be 1-31)'
  },
  errorInvalidMonth: {
    id: 'Bulan lahir tidak valid (bulan harus 1-12)',
    en: 'Invalid birth month (month must be 1-12)'
  },
  errorDateNotExist: {
    id: 'Tanggal tidak valid (tanggal tidak ada)',
    en: 'Invalid date (date does not exist)'
  },
  errorProvinceNotFound: {
    id: 'Provinsi tidak ditemukan',
    en: 'Province not found'
  },
  errorRegencyNotFound: {
    id: 'Kabupaten tidak ditemukan',
    en: 'Regency not found'
  },
  errorDistrictNotFound: {
    id: 'Kecamatan tidak ditemukan',
    en: 'District not found'
  }
} as const

export type TranslationKey = keyof typeof translations
