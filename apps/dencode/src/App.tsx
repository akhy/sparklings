import { useState } from 'react'

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const encode = (type: string) => {
    try {
      let result = ''
      switch (type) {
        case 'base64':
          result = btoa(input)
          break
        case 'url':
          result = encodeURIComponent(input)
          break
        case 'hex':
          result = Array.from(input)
            .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('')
          break
        default:
          result = input
      }
      setOutput(result)
    } catch (error) {
      setOutput('Error: ' + (error as Error).message)
    }
  }

  const decode = (type: string) => {
    try {
      let result = ''
      switch (type) {
        case 'base64':
          result = atob(output)
          break
        case 'url':
          result = decodeURIComponent(output)
          break
        case 'hex':
          result = output.match(/.{1,2}/g)
            ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
            .join('') || ''
          break
        default:
          result = output
      }
      setInput(result)
    } catch (error) {
      setInput('Error: ' + (error as Error).message)
    }
  }

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
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Enter text to encode..."
            />
            <div className="mt-4 flex gap-2 flex-wrap">
              <button
                onClick={() => encode('base64')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Encode Base64
              </button>
              <button
                onClick={() => encode('url')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Encode URL
              </button>
              <button
                onClick={() => encode('hex')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Encode Hex
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output
            </label>
            <textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
              placeholder="Encoded result will appear here..."
            />
            <div className="mt-4 flex gap-2 flex-wrap">
              <button
                onClick={() => decode('base64')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Decode Base64
              </button>
              <button
                onClick={() => decode('url')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Decode URL
              </button>
              <button
                onClick={() => decode('hex')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Decode Hex
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
