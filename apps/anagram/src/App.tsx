import { useState, useEffect } from 'react'
import { Attribution } from '@sparklings/ui'
import { calculateBalance, shuffleArray, getContractedKey } from './anagram'

interface AnagramPair {
  left: string
  right: string
}

const DEFAULT_FAMOUS_ANAGRAMS: AnagramPair[] = [
  { left: 'Tom Marvolo Riddle', right: 'I am Lord Voldemort' }
]

function App() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [leftMissing, setLeftMissing] = useState<string[]>([])
  const [rightMissing, setRightMissing] = useState<string[]>([])
  const [isMatched, setIsMatched] = useState(false)
  const [suggestion, setSuggestion] = useState<AnagramPair | null>(null)
  const [savedPairs, setSavedPairs] = useState<AnagramPair[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [showList, setShowList] = useState(false)

  // Load saved pairs & handle seeding
  useEffect(() => {
    try {
      const seeded = localStorage.getItem('anagram-seeded')
      if (!seeded) {
        // Seed initial famous anagrams
        localStorage.setItem('anagram-saved-pairs', JSON.stringify(DEFAULT_FAMOUS_ANAGRAMS))
        localStorage.setItem('anagram-seeded', 'true')
        setSavedPairs(DEFAULT_FAMOUS_ANAGRAMS)
      } else {
        const stored = localStorage.getItem('anagram-saved-pairs')
        if (stored) {
          const parsed: AnagramPair[] = JSON.parse(stored)
          // Deduplicate to make sure no duplicate keys exist
          const seen = new Set<string>()
          const deduplicated = parsed.filter(p => {
            const key = getContractedKey(p.left)
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
          setSavedPairs(deduplicated)
        }
      }
    } catch (e) {
      console.error('Failed to handle database seeding:', e)
    }
  }, [])

  // Recalculate missing letters and match status when inputs change
  useEffect(() => {
    const result = calculateBalance(leftText, rightText)
    setLeftMissing(result.leftMissing)
    setRightMissing(result.rightMissing)
    setIsMatched(result.isMatched)

    if (result.isMatched) {
      const currentKey = getContractedKey(leftText)
      const alreadySaved = savedPairs.some(p => getContractedKey(p.left) === currentKey)
      setIsSaved(alreadySaved)
    } else {
      setIsSaved(false)
    }
  }, [leftText, rightText, savedPairs])

  // Select initial random suggestion
  useEffect(() => {
    selectRandomSuggestion()
  }, [])

  const selectRandomSuggestion = () => {
    const randomIndex = Math.floor(Math.random() * DEFAULT_FAMOUS_ANAGRAMS.length)
    setSuggestion(DEFAULT_FAMOUS_ANAGRAMS[randomIndex])
  }

  const handleLoadSuggestion = () => {
    if (!suggestion) return
    setLeftText(suggestion.left)
    setRightText('')
  }

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

  const handleSavePair = () => {
    if (!isMatched) return
    const currentKey = getContractedKey(leftText)
    const newPair: AnagramPair = { left: leftText, right: rightText }

    // Deduplicate: filter out any existing saved pair with same key
    const filtered = savedPairs.filter(p => getContractedKey(p.left) !== currentKey)
    const updated = [newPair, ...filtered]
    
    setSavedPairs(updated)
    localStorage.setItem('anagram-saved-pairs', JSON.stringify(updated))
    setIsSaved(true)
  }

  const handleDeletePair = (pair: AnagramPair, e: React.MouseEvent) => {
    e.stopPropagation() // Avoid loading the deleted pair
    const keyToDelete = getContractedKey(pair.left)
    const updated = savedPairs.filter(p => getContractedKey(p.left) !== keyToDelete)
    setSavedPairs(updated)
    localStorage.setItem('anagram-saved-pairs', JSON.stringify(updated))
  }

  const handleLoadPair = (pair: AnagramPair) => {
    setLeftText(pair.left)
    setRightText(pair.right)
  }

  const handleExportText = () => {
    if (savedPairs.length === 0) return
    const content = savedPairs.map(p => `${p.left} == ${p.right}`).join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'anagram-collection.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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

          {/* Interactive Suggestion */}
          {suggestion && (
            <div className="mt-6 inline-flex items-center gap-2 bg-slate-900/40 border border-slate-800/80 px-4 py-2 rounded-full text-xs sm:text-sm text-slate-400 shadow-md">
              💡 Not sure how it works? Try{' '}
              <button
                onClick={handleLoadSuggestion}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline decoration-indigo-400/40 active:scale-95 transition cursor-pointer"
              >
                "{suggestion.left}"
              </button>{' '}
              and figure out its anagram.
              <button
                onClick={selectRandomSuggestion}
                className="text-slate-500 hover:text-slate-300 ml-1 active:scale-95 transition font-semibold"
                title="Show another example"
              >
                🎲 Next
              </button>
            </div>
          )}
        </header>

        {/* Toolbar */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={handleSwap}
            disabled={!leftText && !rightText}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-850 active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <span>🔄 Swap Phrases</span>
          </button>
          <button
            onClick={handleClear}
            disabled={!leftText && !rightText}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-red-950/40 hover:border-red-900/60 text-red-400 rounded-xl text-sm font-medium hover:bg-red-950/20 active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
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
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-medium transition active:scale-95 cursor-pointer"
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
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-medium transition active:scale-95 cursor-pointer"
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
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-455 font-mono font-bold text-lg select-all"
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

        {/* Status & Save Area */}
        {isMatched && (
          <div className="relative mb-10 overflow-hidden rounded-2xl bg-slate-900/40 border border-emerald-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-950/20">
            <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none"></div>
            <div>
              <h3 className="text-emerald-400 font-extrabold text-lg sm:text-xl flex items-center gap-2">
                ✨ PERFECT ANAGRAM MATCH! ✨
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Both phrases contain the exact same characters.
              </p>
            </div>
            {!isSaved && (
              <button
                onClick={handleSavePair}
                className="px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer transition active:scale-95 bg-emerald-500 hover:bg-emerald-600 text-slate-950"
              >
                💾 Save Pair
              </button>
            )}
          </div>
        )}

        {/* Collection Toggle Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowList(!showList)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition active:scale-95"
          >
            <span>{showList ? '🙈 Hide Collection' : `📚 View Collection (${savedPairs.length})`}</span>
          </button>
        </div>

        {/* Anagram Collection */}
        {showList && (
          <section className="bg-slate-900/25 border border-slate-800/80 rounded-2xl p-6 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-350 flex items-center gap-2">
                📚 Anagram Collection
              </h2>
              {savedPairs.length > 0 && (
                <button
                  onClick={handleExportText}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-450 hover:text-white rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  📥 Export (.txt)
                </button>
              )}
            </div>
            {savedPairs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedPairs.map((pair) => {
                  const uniqueKey = getContractedKey(pair.left)
                  return (
                    <div
                      key={uniqueKey}
                      onClick={() => handleLoadPair(pair)}
                      className="bg-slate-950/40 border border-slate-800/80 hover:border-indigo-500/35 hover:bg-slate-900/40 px-4 py-3 rounded-xl cursor-pointer group flex justify-between items-center transition duration-200"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="text-sm font-medium text-slate-300 group-hover:text-white truncate">
                          {pair.left}
                        </div>
                        <div className="text-xs text-slate-500 group-hover:text-slate-400 truncate mt-0.5">
                          {pair.right}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDeletePair(pair, e)}
                          className="p-1.5 text-slate-600 hover:text-red-400 rounded-lg hover:bg-slate-900 transition cursor-pointer"
                          title="Delete from collection"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 italic text-sm">
                Your collection is empty. Match and save some anagrams!
              </div>
            )}
          </section>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-500 space-y-3">
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
