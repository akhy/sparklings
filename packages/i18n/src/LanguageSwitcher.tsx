import type { Language } from './types'

export interface LanguageSwitcherProps {
  /**
   * Current active language
   */
  language: Language

  /**
   * Callback when language is changed
   */
  onLanguageChange: (lang: Language) => void

  /**
   * Optional CSS class names
   */
  className?: string
}

/**
 * Language switcher component with ID/EN toggle buttons
 *
 * @example
 * ```tsx
 * function App() {
 *   const { language, setLanguage } = useLanguage(translations)
 *
 *   return (
 *     <LanguageSwitcher
 *       language={language}
 *       onLanguageChange={setLanguage}
 *     />
 *   )
 * }
 * ```
 */
export function LanguageSwitcher({
  language,
  onLanguageChange,
  className = ''
}: LanguageSwitcherProps) {
  return (
    <div className={className}>
      <button
        onClick={() => onLanguageChange('id')}
        className={`px-3 py-1 text-sm font-medium transition ${
          language === 'id'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-label="Switch to Indonesian"
        aria-pressed={language === 'id'}
      >
        ID
      </button>
      <span className="text-gray-300 mx-1" aria-hidden="true">
        |
      </span>
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-3 py-1 text-sm font-medium transition ${
          language === 'en'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        EN
      </button>
    </div>
  )
}
