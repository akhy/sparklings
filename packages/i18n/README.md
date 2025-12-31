# @sparklings/i18n

Shared internationalization (i18n) utilities for the Sparklings monorepo. Provides type-safe translation management with support for Indonesian (default) and English.

## Features

- 🔒 **Type-safe translations** - Full TypeScript support with autocomplete
- 🌐 **Dual language support** - Indonesian (id) and English (en)
- 💾 **Persistent language preference** - Saves to localStorage
- ⚛️ **React hooks** - Easy integration with React components
- 🎨 **UI component included** - Ready-to-use language switcher

## Installation

This package is already available in the monorepo workspace:

```bash
# Add to your app's package.json
pnpm add @sparklings/i18n --filter=your-app
```

## Usage

### 1. Define your translations

Create an `i18n.ts` file in your app:

```typescript
import type { Language } from '@sparklings/i18n'

export const translations = {
  title: {
    id: 'Judul Aplikasi',
    en: 'App Title'
  },
  subtitle: {
    id: 'Deskripsi aplikasi',
    en: 'App description'
  },
  welcome: {
    id: 'Selamat datang!',
    en: 'Welcome!'
  }
} as const

export type TranslationKey = keyof typeof translations
```

### 2. Use in your components

```typescript
import { useLanguage, LanguageSwitcher } from '@sparklings/i18n'
import { translations } from './i18n'

function App() {
  const { language, setLanguage, t } = useLanguage(translations, {
    storageKey: 'my-app-language', // Custom localStorage key
    defaultLanguage: 'id' // Optional: defaults to 'id'
  })

  return (
    <div>
      {/* Language switcher in header */}
      <header>
        <LanguageSwitcher
          language={language}
          onLanguageChange={setLanguage}
          className="my-custom-class"
        />
      </header>

      {/* Use translations */}
      <main>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
        <p>{t('welcome')}</p>
      </main>
    </div>
  )
}
```

## API Reference

### Types

#### `Language`
```typescript
type Language = 'id' | 'en'
```

#### `TranslationDict`
```typescript
type TranslationDict = {
  [key: string]: {
    id: string
    en: string
  }
}
```

### `useLanguage(translations, options)`

React hook for managing language state and translations.

**Parameters:**
- `translations`: Your translation dictionary
- `options` (optional):
  - `storageKey`: localStorage key (default: `'app-language'`)
  - `defaultLanguage`: Default language (default: `'id'`)

**Returns:**
- `language`: Current active language
- `setLanguage`: Function to change language
- `t`: Type-safe translation function

### `LanguageSwitcher`

UI component for switching between languages.

**Props:**
- `language`: Current active language
- `onLanguageChange`: Callback when language changes
- `className`: Optional CSS classes

## Migration from noktp

If you're migrating from noktp's implementation:

1. Add `@sparklings/i18n` to your app's dependencies
2. Update imports:
   ```typescript
   // Before
   import { Language, TranslationKey } from './i18n'
   import { useLanguage } from './useLanguage'
   import { LanguageSwitcher } from './LanguageSwitcher'

   // After
   import type { Language } from '@sparklings/i18n'
   import { useLanguage, LanguageSwitcher } from '@sparklings/i18n'
   ```
3. Update `useLanguage` call to include translations:
   ```typescript
   // Before
   const { language, setLanguage, t } = useLanguage()

   // After
   const { language, setLanguage, t } = useLanguage(translations, {
     storageKey: 'noktp-language' // Keep the same key for persistence
   })
   ```
4. Remove local `i18n.ts`, `useLanguage.ts`, and `LanguageSwitcher.tsx` files (keep only the translations object)

## Example Apps

See these apps for reference implementations:
- `apps/noktp` - Original implementation (will be migrated)
- More apps coming soon!
