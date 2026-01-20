# Translation Strategy Documentation (next-intl Migration)

## Overview

Our application uses **next-intl** for internationalization, focusing on a **Static Site Generation (SSG)** approach for maximum performance and SEO.

## The Strategy

1.  **Single Source of Truth**: All static translations (UI labels, buttons, etc.) are stored in `src/i18n/content.ts`.
2.  **Type-Safety**: We use auto-generated UPPERCASE constants (`T`) to reference keys, ensuring Intellisense and build-time validation.
3.  **Locale-based Routing**: URLs are prefixed with the locale (e.g., `/en/shop`, `/ar/shop`).
4.  **SSG**: Content is pre-rendered at build time for both English and Arabic.

---

## 🏗️ Implementation Details

### 1. The Content Dictionary (`src/i18n/content.ts`)

This is the **only** file you need to edit to add or modify translations.

```typescript
export const DICTIONARY = {
  COMMON: {
    SAVE: { en: 'Save', ar: 'حفظ' },
    CANCEL: { en: 'Cancel', ar: 'إلغاء' },
  },
  NAV: {
    HOME: { en: 'Home', ar: 'الرئيسية' },
  }
} as const;
```

### 2. Usage in Components

We use the standard `useTranslations` hook from `next-intl` combined with our type-safe `T` constant.

#### ✅ Recommended Approach
```tsx
import { useTranslations } from 'next-intl';
import { T } from '@/i18n/content';

export function SaveButton() {
  const t = useTranslations();
  
  // Type-safe: T.COMMON.SAVE provides the path string automatically
  return <button>{t(T.COMMON.SAVE)}</button>;
}
```

---

## 🌍 Language & Direction (RTL)

Direction is handled automatically via CSS in `src/app/globals.css`, targeting the `lang` attribute on the `html` tag.

```css
/* src/app/globals.css */
html[lang="ar"] {
  direction: rtl;
}
html[lang="en"] {
  direction: ltr;
}
```

Next.js sets the `lang` attribute based on the current locale segment.

---

## 🛠️ Developer Workflow

To add a new translation:
1.  Open `src/i18n/content.ts`.
2.  Add your key and values to the `DICTIONARY` object.
3.  The `T` constant will update automatically thanks to TypeScript's inference.
4.  Use `t(T.YOUR_NEW_KEY)` in your component.

---

## 🔗 Related Files
- `src/i18n/routing.ts`: Defines supported locales and default locale.
- `src/i18n/request.ts`: Configures how `next-intl` loads the dictionary.
- `src/middleware.ts`: Handles the URL routing/redirects for locales.
- `src/types/intl.d.ts`: Provides global type definitions for translation keys.
