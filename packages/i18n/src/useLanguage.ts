import { useState, useEffect, useCallback } from 'react'
import type { Language, TranslationDict, TranslationKey, LanguageOptions } from './types'

const DEFAULT_STORAGE_KEY = 'app-language'
const DEFAULT_LANGUAGE: Language = 'id'

/**
 * Hook for managing language state and translations
 *
 * @param translations - Translation dictionary with 'id' and 'en' keys
 * @param options - Configuration options for storage and defaults
 * @returns Language state, setter, and translation function
 *
 * @example
 * ```tsx
 * const translations = {
 *   title: { id: 'Judul', en: 'Title' },
 *   subtitle: { id: 'Subjudul', en: 'Subtitle' }
 * } as const
 *
 * function MyComponent() {
 *   const { language, setLanguage, t } = useLanguage(translations, {
 *     storageKey: 'my-app-language'
 *   })
 *
 *   return <h1>{t('title')}</h1>
 * }
 * ```
 */
export function useLanguage<T extends TranslationDict>(
  translations: T,
  options: LanguageOptions = {}
) {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    defaultLanguage = DEFAULT_LANGUAGE
  } = options

  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      return (stored === 'id' || stored === 'en') ? stored : defaultLanguage
    }
    return defaultLanguage
  })

  // Persist to localStorage whenever language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, language)
    }
  }, [language, storageKey])

  // Translation function with type safety
  const t = useCallback((key: TranslationKey<T>): string => {
    return translations[key][language]
  }, [language, translations])

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
