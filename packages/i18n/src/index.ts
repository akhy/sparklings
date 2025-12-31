/**
 * @sparklings/i18n
 *
 * Shared internationalization (i18n) utilities for the Sparklings monorepo.
 * Provides type-safe translation management with support for Indonesian (default) and English.
 *
 * @example
 * ```tsx
 * // 1. Define your translations
 * import type { Language } from '@sparklings/i18n'
 *
 * export const translations = {
 *   title: { id: 'Judul', en: 'Title' },
 *   subtitle: { id: 'Subjudul', en: 'Subtitle' }
 * } as const
 *
 * export type TranslationKey = keyof typeof translations
 *
 * // 2. Use in your components
 * import { useLanguage, LanguageSwitcher } from '@sparklings/i18n'
 * import { translations } from './i18n'
 *
 * function App() {
 *   const { language, setLanguage, t } = useLanguage(translations, {
 *     storageKey: 'my-app-language'
 *   })
 *
 *   return (
 *     <div>
 *       <LanguageSwitcher language={language} onLanguageChange={setLanguage} />
 *       <h1>{t('title')}</h1>
 *       <p>{t('subtitle')}</p>
 *     </div>
 *   )
 * }
 * ```
 */

export type { Language, TranslationDict, TranslationKey, LanguageOptions } from './types'
export { useLanguage } from './useLanguage'
export { LanguageSwitcher } from './LanguageSwitcher'
export type { LanguageSwitcherProps } from './LanguageSwitcher'
