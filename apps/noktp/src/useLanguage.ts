import { useState, useEffect, useCallback } from 'react'
import { Language, translations, TranslationKey } from './i18n'

const STORAGE_KEY = 'noktp-language'
const DEFAULT_LANGUAGE: Language = 'id'

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage on initial render
    const stored = localStorage.getItem(STORAGE_KEY)
    return (stored === 'id' || stored === 'en') ? stored : DEFAULT_LANGUAGE
  })

  // Persist to localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language)
  }, [language])

  // Translation function
  const t = useCallback((key: TranslationKey): string => {
    return translations[key][language]
  }, [language])

  // Set language function
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
  }, [])

  return {
    language,
    setLanguage,
    t
  }
}
