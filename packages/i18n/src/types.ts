/**
 * Supported languages: Indonesian (default) and English
 */
export type Language = 'id' | 'en'

/**
 * Translation dictionary structure
 * Each key maps to an object with 'id' and 'en' properties
 */
export type TranslationDict = {
  [key: string]: {
    id: string
    en: string
  }
}

/**
 * Extract translation keys from a translation dictionary
 */
export type TranslationKey<T extends TranslationDict> = keyof T

/**
 * Language context options
 */
export interface LanguageOptions {
  /**
   * Storage key for localStorage persistence
   * @default 'app-language'
   */
  storageKey?: string

  /**
   * Default language
   * @default 'id'
   */
  defaultLanguage?: Language
}
