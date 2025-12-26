import { useState } from 'react'
import { Attribution } from '@sparklings/ui'

function App() {
  const [leftInput, setLeftInput] = useState('')
  const [rightInput, setRightInput] = useState('')

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">StructDiff</h1>
          <p className="text-sm text-gray-600">Configurable JSON/YAML Diff Tool</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Left Panel */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Left Input
              </label>
              <textarea
                value={leftInput}
                onChange={(e) => setLeftInput(e.target.value)}
                placeholder="Paste your JSON/YAML here..."
                className="flex-1 min-h-[500px] font-mono text-sm p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Right Panel */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Right Input
              </label>
              <textarea
                value={rightInput}
                onChange={(e) => setRightInput(e.target.value)}
                placeholder="Paste your JSON/YAML here..."
                className="flex-1 min-h-[500px] font-mono text-sm p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          <Attribution appName="structdiff" />
        </div>
      </footer>
    </div>
  )
}

export default App
