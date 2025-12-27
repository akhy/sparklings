import { useState } from 'react'
import { encode, decode, type EncodingMode } from './encoder'

function App() {
  const [plain, setPlain] = useState('')
  const [encoded, setEncoded] = useState('')
  const [mode, setMode] = useState<EncodingMode>('base64')

  const handleEncode = () => {
    const result = encode(plain, mode)
    if (result.success) {
      setEncoded(result.result)
    } else {
      setEncoded('Error: ' + result.error)
    }
  }

  const handleDecode = () => {
    const result = decode(encoded, mode)
    if (result.success) {
      setPlain(result.result)
    } else {
      setPlain('Error: ' + result.error)
    }
  }

  const encodingModes = [
    { value: 'base64', label: 'Base64' },
    { value: 'url', label: 'URL' },
    { value: 'hex', label: 'Hex' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Dencode
        </h1>
        <p className="text-center text-gray-600 mb-8">
          String Encoder/Decoder
        </p>

        <div className="space-y-4">
          {/* Plain Text Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plain
            </label>
            <textarea
              value={plain}
              onChange={(e) => setPlain(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Enter plain text..."
            />
          </div>

          {/* Controls Section */}
          <div className="flex items-center justify-center gap-4">
            {/* Encode Button */}
            <button
              onClick={handleEncode}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 font-medium shadow-md"
            >
              <span>Encode</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mode Dropdown */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as EncodingMode)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium bg-white shadow-md"
            >
              {encodingModes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Decode Button */}
            <button
              onClick={handleDecode}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2 font-medium shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>Decode</span>
            </button>
          </div>

          {/* Encoded Text Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Encoded
            </label>
            <textarea
              value={encoded}
              onChange={(e) => setEncoded(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
              placeholder="Encoded result will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
