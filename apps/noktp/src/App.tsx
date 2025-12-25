import { useState } from 'react'
import { NIKParsed, parseNIK, formatNIK, formatBirthDate } from './nikParser'

function App() {
  const [nik, setNik] = useState('')
  const [parsed, setParsed] = useState<NIKParsed | null>(null)

  const handleInputChange = (value: string) => {
    setNik(value)
    if (value.replace(/\s/g, '').length === 16) {
      setParsed(parseNIK(value))
    } else {
      setParsed(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
          NoKTP
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Indonesian NIK (KTP Number) Breakdown
        </p>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter NIK (16 digits)
          </label>
          <input
            type="text"
            value={formatNIK(nik)}
            onChange={(e) => handleInputChange(e.target.value.replace(/\s/g, ''))}
            maxLength={18} // 16 digits + 2 spaces
            placeholder="XXXXXX XXXXXX XXXX"
            className="w-full px-4 py-3 text-2xl font-mono border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Parsed Result */}
        {parsed && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {parsed.isValid ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Valid NIK
                </div>

                {/* Visual Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Location Code</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Province:</span>
                        <span className="font-mono font-semibold">{parsed.provinceCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Regency/City:</span>
                        <span className="font-mono font-semibold">{parsed.regencyCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">District:</span>
                        <span className="font-mono font-semibold">{parsed.districtCode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Birth Info */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Birth Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-mono font-semibold">{parsed.birthDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Month:</span>
                        <span className="font-mono font-semibold">{parsed.birthMonth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year:</span>
                        <span className="font-mono font-semibold">
                          {parsed.birthYear} ({parseInt(parsed.birthYear) >= 25 ? '19' : '20'}{parsed.birthYear})
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {formatBirthDate(parsed)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Gender</h3>
                    <div className={`text-2xl font-bold ${parsed.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`}>
                      {parsed.gender === 'male' ? '♂ Male' : '♀ Female'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {parsed.gender === 'female' && 'Birth date + 40 indicates female'}
                    </p>
                  </div>

                  {/* Serial Number */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Serial Number</h3>
                    <div className="text-2xl font-mono font-bold text-gray-800">
                      {parsed.serialNumber}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Unique registration number
                    </p>
                  </div>
                </div>

                {/* Visual NIK Breakdown */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Visual Breakdown</h3>
                  <div className="flex flex-wrap gap-1 font-mono text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{parsed.provinceCode}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{parsed.regencyCode}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{parsed.districtCode}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{parsed.birthDate}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{parsed.birthMonth}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{parsed.birthYear}</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">{parsed.serialNumber}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-blue-100 rounded"></span>
                      Location
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-green-100 rounded"></span>
                      Birth Date
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-purple-100 rounded"></span>
                      Serial
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600 font-semibold">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Invalid NIK
                </div>
                <ul className="list-disc list-inside text-red-600 text-sm">
                  {parsed.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">About NIK</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• NIK (Nomor Induk Kependudukan) is a 16-digit unique identifier on Indonesian KTP</p>
            <p>• First 6 digits: Administrative location code (Province, Regency, District)</p>
            <p>• Next 6 digits: Date of birth in DDMMYY format</p>
            <p>• For females, 40 is added to the birth date (e.g., 47 = 7th day, female)</p>
            <p>• Last 4 digits: Unique serial registration number</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-gray-500 space-y-2">
          <p className="text-gray-400">
            Disclaimer: This tool is for educational purposes only. No data is stored or transmitted.
          </p>
          <p>
            Part of{' '}
            <a
              href="https://github.com/chickenzord/sparklings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Sparklings
            </a>
            {' '}by{' '}
            <a
              href="https://github.com/akhy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              akhy
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
