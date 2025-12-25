import { useState, useEffect } from 'react'
import { Attribution } from '@sparklings/ui'
import { NIKParsed, parseNIK, formatNIK, formatBirthDate } from './nikParser'
import { LocationData, getLocationData } from './locationService'
import { useLanguage } from './useLanguage'
import { LanguageSwitcher } from './LanguageSwitcher'

function App() {
  const { language, setLanguage, t } = useLanguage()
  const [nik, setNik] = useState('')
  const [parsed, setParsed] = useState<NIKParsed | null>(null)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)

  const handleInputChange = (value: string) => {
    setNik(value)
    if (value.replace(/\s/g, '').length === 16) {
      setParsed(parseNIK(value))
    } else {
      setParsed(null)
      setLocation(null)
    }
  }

  // Fetch location data when NIK is parsed
  useEffect(() => {
    if (!parsed || !parsed.isValid) {
      setLocation(null)
      return
    }

    const fetchLocation = async () => {
      setLoadingLocation(true)
      try {
        const locationData = await getLocationData(
          parsed.provinceCode,
          parsed.regencyCode,
          parsed.districtCode
        )
        setLocation(locationData)
      } catch (error) {
        console.error('Failed to fetch location:', error)
        setLocation(null)
      } finally {
        setLoadingLocation(false)
      }
    }

    fetchLocation()
  }, [parsed])

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-center text-gray-800">
              {t('title')}
            </h1>
          </div>
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} />
        </div>
        <p className="text-center text-gray-600 mb-8">
          {t('subtitle')}
        </p>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('inputLabel')}
          </label>
          <input
            type="text"
            value={formatNIK(nik)}
            onChange={(e) => handleInputChange(e.target.value.replace(/\s/g, ''))}
            maxLength={18} // 16 digits + 2 spaces
            placeholder={t('inputPlaceholder')}
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
                  {t('validNik')}
                </div>

                {/* Visual Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">{t('location')}</h3>
                    {loadingLocation ? (
                      <div className="text-center py-4 text-gray-500">
                        <div className="animate-pulse">{t('loadingLocation')}</div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">{t('province')} ({parsed.provinceCode})</div>
                          <div className="font-semibold text-gray-800">
                            {location?.provinceName || t('unknown')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">{t('regency')} ({parsed.regencyCode})</div>
                          <div className="font-semibold text-gray-800">
                            {location?.regencyName || t('unknown')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">{t('district')} ({parsed.districtCode})</div>
                          <div className="font-semibold text-gray-800">
                            {location?.districtName || t('unknown')}
                          </div>
                        </div>
                        {location?.error && (
                          <div className="text-xs text-amber-600 mt-2">
                            ⚠️ {location.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Birth Info */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">{t('birthInfo')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('date')}:</span>
                        <span className="font-mono font-semibold">{parsed.birthDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('month')}:</span>
                        <span className="font-mono font-semibold">{parsed.birthMonth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('year')}:</span>
                        <span className="font-mono font-semibold">
                          {parsed.birthYear} ({parseInt(parsed.birthYear) >= 25 ? '19' : '20'}{parsed.birthYear})
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {formatBirthDate(parsed, language === 'id' ? 'id-ID' : 'en-US')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">{t('gender')}</h3>
                    <div className={`text-2xl font-bold ${parsed.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`}>
                      {parsed.gender === 'male' ? t('male') : t('female')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {parsed.gender === 'female' && t('femaleNote')}
                    </p>
                  </div>

                  {/* Serial Number */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">{t('serialNumber')}</h3>
                    <div className="text-2xl font-mono font-bold text-gray-800">
                      {parsed.serialNumber}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('serialNote')}
                    </p>
                  </div>
                </div>

                {/* Visual NIK Breakdown */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">{t('visualBreakdown')}</h3>
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
                      {t('location')}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-green-100 rounded"></span>
                      {t('birthInfo')}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-purple-100 rounded"></span>
                      {t('serialNumber')}
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
                  {t('invalidNik')}
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
          <h3 className="font-semibold text-blue-800 mb-2">{t('aboutTitle')}</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• {t('aboutNik1')}</p>
            <p>• {t('aboutNik2')}</p>
            <p>• {t('aboutNik3')}</p>
            <p>• {t('aboutNik4')}</p>
            <p>• {t('aboutNik5')}</p>
            <p>• {t('aboutNik6')} <a href="https://ibnux.github.io/data-indonesia/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Data Indonesia API</a></p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-gray-500 space-y-2">
          <p className="text-gray-400">
            {t('disclaimer')}
          </p>
          <p>
            <Attribution appName="noktp" />
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
