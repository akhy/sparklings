import { useState, useEffect } from 'react'
import { Attribution } from '@sparklings/ui'
import CodeMirror from '@uiw/react-codemirror'
import { yaml } from '@codemirror/lang-yaml'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import { getExample } from './examples'
import { normalize, NormalizationConfig, Format } from './normalizer'
import { diff } from './unidiff'

function App() {
  const [leftInput, setLeftInput] = useState('')
  const [rightInput, setRightInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [diffResult, setDiffResult] = useState('')
  const [error, setError] = useState('')

  // Normalization config with sortKeys enabled by default
  const [config, setConfig] = useState<NormalizationConfig>({
    sortKeys: true,
    ignoreWhitespace: false,
    ignoreArrayOrder: false,
    normalizeTypes: false,
    trimStrings: false,
  })

  // Detect theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const detectFormat = (input: string): Format => {
    const trimmed = input.trim()
    // Try to detect JSON (starts with { or [)
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return 'json'
    }
    // Otherwise assume YAML
    return 'yaml'
  }

  const handleCompare = () => {
    try {
      setError('')

      // Detect format (use left input to determine)
      const format = detectFormat(leftInput)

      // Normalize both inputs
      const leftNormalized = normalize(leftInput, format, config)
      const rightNormalized = normalize(rightInput, format, config)

      // Generate diff
      const result = diff(leftNormalized, rightNormalized, { format: 'json' })

      console.log({result})
      setDiffResult(result)
      setShowModal(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setDiffResult('')
      setShowModal(true)
    }
  }

  const handleLoadExample = () => {
    const example = getExample(0)
    setLeftInput(example.left)
    setRightInput(example.right)
  }

  const renderDiffLine = (line: string, index: number) => {
    // Check the first character to determine line type
    const firstChar = line.charAt(0)

    if (firstChar === '+') {
      // Added line - green background and text
      return (
        <div key={index} className="bg-success/20 text-success px-2 -mx-2">
          {line}
        </div>
      )
    } else if (firstChar === '-') {
      // Removed line - red background and text
      return (
        <div key={index} className="bg-error/20 text-error px-2 -mx-2">
          {line}
        </div>
      )
    } else if (line.startsWith('@@')) {
      // Chunk header - cyan/info color
      return (
        <div key={index} className="bg-info/20 text-info px-2 -mx-2 font-semibold">
          {line}
        </div>
      )
    } else {
      // Context line - normal
      return (
        <div key={index} className="text-base-content/70 px-2 -mx-2">
          {line}
        </div>
      )
    }
  }

  return (
    <div className="drawer drawer-end">
      <input
        id="config-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={configOpen}
        onChange={(e) => setConfigOpen(e.target.checked)}
      />

      <div className="drawer-content min-h-screen bg-base-200 flex flex-col">
        {/* Header */}
        <header className="bg-base-100 shadow-sm border-b border-base-300">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">StructDiff</h1>
              <p className="text-sm text-base-content/70">Configurable JSON/YAML Diff Tool</p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-secondary"
                onClick={handleLoadExample}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Load Example
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCompare}
                disabled={!leftInput || !rightInput}
              >
                Compare
              </button>
              <label htmlFor="config-drawer" className="btn btn-ghost drawer-button">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Config
              </label>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {/* Left Panel */}
              <div className="flex flex-col min-w-0">
                <label className="label">
                  <span className="label-text font-medium">Left Input</span>
                </label>
                <div className="border border-base-300 rounded-lg overflow-hidden">
                  <CodeMirror
                    value={leftInput}
                    minHeight="500px"
                    maxHeight="500px"
                    theme={isDark ? githubDark : githubLight}
                    extensions={[yaml()]}
                    onChange={(value) => setLeftInput(value)}
                    placeholder="Paste your JSON/YAML here..."
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLineGutter: true,
                      highlightActiveLine: true,
                      foldGutter: true,
                    }}
                  />
                </div>
              </div>

              {/* Right Panel */}
              <div className="flex flex-col min-w-0">
                <label className="label">
                  <span className="label-text font-medium">Right Input</span>
                </label>
                <div className="border border-base-300 rounded-lg overflow-hidden">
                  <CodeMirror
                    value={rightInput}
                    minHeight="500px"
                    maxHeight="500px"
                    theme={isDark ? githubDark : githubLight}
                    extensions={[yaml()]}
                    onChange={(value) => setRightInput(value)}
                    placeholder="Paste your JSON/YAML here..."
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLineGutter: true,
                      highlightActiveLine: true,
                      foldGutter: true,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-base-100 border-t border-base-300 py-4">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-base-content/70">
            <Attribution appName="structdiff" />
          </div>
        </footer>
      </div>

      {/* Configuration Drawer */}
      <div className="drawer-side z-50">
        <label htmlFor="config-drawer" className="drawer-overlay"></label>
        <div className="bg-base-100 min-h-full w-80 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Configuration</h2>
            <label htmlFor="config-drawer" className="btn btn-sm btn-circle btn-ghost">
              ✕
            </label>
          </div>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Sort Keys</span>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={config.sortKeys}
                  onChange={(e) => setConfig({ ...config, sortKeys: e.target.checked })}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Ignore Whitespace</span>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={config.ignoreWhitespace}
                  onChange={(e) => setConfig({ ...config, ignoreWhitespace: e.target.checked })}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Ignore Array Order</span>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={config.ignoreArrayOrder}
                  onChange={(e) => setConfig({ ...config, ignoreArrayOrder: e.target.checked })}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Normalize Types</span>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={config.normalizeTypes}
                  onChange={(e) => setConfig({ ...config, normalizeTypes: e.target.checked })}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Trim Strings</span>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={config.trimStrings}
                  onChange={(e) => setConfig({ ...config, trimStrings: e.target.checked })}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-7xl w-full h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Comparison Results</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="bg-base-200 rounded-lg p-4 h-[calc(100%-4rem)] overflow-auto">
              {error ? (
                <div className="alert alert-error">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              ) : diffResult === '' ? (
                <div className="alert alert-success">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>No differences found. The inputs are identical after normalization.</span>
                </div>
              ) : (
                <pre className="font-mono text-sm whitespace-pre-wrap">
                  {diffResult.split('\n').map(renderDiffLine)}
                </pre>
              )}
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}>
            <button>close</button>
          </div>
        </dialog>
      )}
    </div>
  )
}

export default App
