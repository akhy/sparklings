import { useState, useEffect } from 'react'
import { Attribution } from '@sparklings/ui'
import { calculateBalance, shuffleArray } from './anagram'

function App() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [leftMissing, setLeftMissing] = useState<string[]>([])
  const [rightMissing, setRightMissing] = useState<string[]>([])
  const [isMatched, setIsMatched] = useState(false)

  // Recalculate missing letters when inputs change
  useEffect(() => {
    const result = calculateBalance(leftText, rightText)
    setLeftMissing(result.leftMissing)
    setRightMissing(result.rightMissing)
    setIsMatched(result.isMatched)
  }, [leftText, rightText])

  const handleShuffle = (side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftMissing(prev => shuffleArray(prev))
    } else {
      setRightMissing(prev => shuffleArray(prev))
    }
  }

  const handleClear = () => {
    setLeftText('')
    setRightText('')
  }

  const handleSwap = () => {
    const temp = leftText
    setLeftText(rightText)
    setRightText(temp)
  }

  const getCleanLength = (str: string) => {
    return str.replace(/[^a-zA-Z0-9]/g, '').length
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
            <div className="bg-slate-950 px-6 py-2 rounded-xl">
              <span className="text-sm font-extrabold uppercase tracking-widest bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Anagram Engine
              </span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Letter Balance Engine
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
            Type two words or phrases to balance their letters. The engine live-calculates missing letters to help you craft perfect anagrams.
          </p>
        </header>

        {/* Toolbar */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={handleSwap}
            disabled={!leftText && !rightText}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-850 active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>🔄 Swap Phrases</span>
          </button>
          <button
            onClick={handleClear}
            disabled={!leftText && !rightText}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-red-950/40 hover:border-red-900/60 text-red-400 rounded-xl text-sm font-medium hover:bg-red-950/20 active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>🗑️ Clear All</span>
          </button>
        </div>

        {/* Layout Grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* LEFT PANEL */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden transition hover:border-slate-700/60 shadow-xl">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-pink-500"></div>
            
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="leftInput" className="text-sm font-bold tracking-wide uppercase text-red-400">
                Left Phrase
              </label>
              <span className="text-xs font-semibold text-slate-500">
                {getCleanLength(leftText)} chars
              </span>
            </div>
            
            <textarea
              id="leftInput"
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              placeholder="Type first word/phrase here..."
              className="w-full h-36 bg-slate-950 border border-slate-800 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 text-white rounded-xl p-4 text-lg font-medium resize-none outline-none placeholder-slate-600 transition"
            />
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center min-h-[28px]">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Missing from Left <span className="text-slate-600">(to match Right)</span>:
                </span>
                {leftMissing.length > 0 && (
                  <button
                    onClick={() => handleShuffle('left')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-medium transition active:scale-95"
                  >
                    🎲 Shuffle
                  </button>
                )}
              </div>

              <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-4 min-h-[72px] flex items-center justify-center flex-wrap gap-2">
                {leftMissing.length > 0 ? (
                  leftMissing.map((char, index) => (
                    <span
                      key={`${char}-${index}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 font-mono font-bold text-lg select-all"
                    >
                      {char}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-600 italic">No missing letters</span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden transition hover:border-slate-700/60 shadow-xl">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="rightInput" className="text-sm font-bold tracking-wide uppercase text-blue-400">
                Right Phrase
              </label>
              <span className="text-xs font-semibold text-slate-500">
                {getCleanLength(rightText)} chars
              </span>
            </div>
            
            <textarea
              id="rightInput"
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              placeholder="Type second word/phrase here..."
              className="w-full h-36 bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-white rounded-xl p-4 text-lg font-medium resize-none outline-none placeholder-slate-600 transition"
            />
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center min-h-[28px]">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Missing from Right <span className="text-slate-600">(to match Left)</span>:
                </span>
                {rightMissing.length > 0 && (
                  <button
                    onClick={() => handleShuffle('right')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-medium transition active:scale-95"
                  >
                    🎲 Shuffle
                  </button>
                )}
              </div>

              <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-4 min-h-[72px] flex items-center justify-center flex-wrap gap-2">
                {rightMissing.length > 0 ? (
                  rightMissing.map((char, index) => (
                    <span
                      key={`${char}-${index}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-450 font-mono font-bold text-lg select-all"
                    >
                      {char}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-600 italic">No missing letters</span>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Status Message */}
        {isMatched && (
          <div className="relative animate-bounce mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-2xl"></div>
            <div className="relative bg-emerald-950/40 border-2 border-dashed border-emerald-500/40 text-emerald-400 text-center font-extrabold text-xl sm:text-2xl p-6 rounded-2xl">
              ✨ PERFECT ANAGRAM MATCH! ✨
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-500 space-y-3">
        <p className="max-w-md mx-auto leading-relaxed text-slate-600">
          Letter Balance Engine compares alphanumeric characters case-insensitively, ignoring spaces and symbols.
        </p>
        <p>
          <Attribution appName="anagram" />
        </p>
      </footer>
    </div>
  )
}

export default App
