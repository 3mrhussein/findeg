'use client';

import { useLocale } from 'next-intl';
import { useTheme } from '@/hooks';
import { useEffect } from 'react';

/**
 * Client component that synchronizes the root HTML element's attributes:
 * - `lang`: The current locale (en, ar, etc.)
 * - `dir`: The text direction (ltr for en, rtl for ar)
 * - `class`: The theme mode (light, dark) via next-themes
 *
 * Necessary because root layouts in Next.js don't re-execute when nested route
 * parameters change or when client-side state changes. This component bridges
 * the gap by updating HTML attributes from the client side after hydration.
 */
export function LocaleSync() {
    const locale = useLocale();
    const { theme, systemTheme, resolvedTheme } = useTheme();

    useEffect(() => {
        // Update the root HTML element attributes whenever locale or theme changes
        const html = document.documentElement;

        // Sync locale attributes
        html.lang = locale;
        html.dir = locale === 'ar' ? 'rtl' : 'ltr';

        // Sync theme class (next-themes uses class attribute for Tailwind)
        // resolvedTheme is the actual theme (light or dark, accounting for system preference)
        const effectiveTheme = resolvedTheme || (theme === 'system' ? systemTheme : theme);
        if (effectiveTheme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }, [locale, theme, systemTheme, resolvedTheme]);

    return null;
}
