'use client';

import { Button } from '@findeg/ui';
import { useToggleLanguage } from '@hooks/useToggleLanguage';

/**
 * A component that allows toggling between available languages with a single button.
 * Shows the flag and label of the current active language.
 */
const ToggleLanguage = () => {
  const { locale, toggleLanguage } = useToggleLanguage();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 px-3"
      onClick={() => toggleLanguage(locale === 'en' ? 'ar' : 'en')}
      aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      {locale === 'en' ? (
        <>
          <span className="text-base" role="img" aria-label="UK Flag">
            🇬🇧
          </span>
          <span className="font-medium">EN</span>
        </>
      ) : (
        <>
          <span className="text-base" role="img" aria-label="Egypt Flag">
            🇪🇬
          </span>
          <span className="font-medium">العربيه</span>
        </>
      )}
    </Button>
  );
};

export default ToggleLanguage;
