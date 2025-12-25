import { Language } from './i18n'

interface LanguageSwitcherProps {
  language: Language
  onLanguageChange: (lang: Language) => void
  className?: string
}

export function LanguageSwitcher({ language, onLanguageChange, className = '' }: LanguageSwitcherProps) {
  return (
    <div className={className}>
      <button
        onClick={() => onLanguageChange('id')}
        className={`px-3 py-1 text-sm font-medium transition ${
          language === 'id'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        ID
      </button>
      <span className="text-gray-300 mx-1">|</span>
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-3 py-1 text-sm font-medium transition ${
          language === 'en'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        EN
      </button>
    </div>
  )
}
