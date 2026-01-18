'use client';

import React, { useState } from 'react';
import { Footer } from '@/presentation/shared/layout/Footer';
import { CookieConsentBanner } from '@/presentation/shared/components/CookieConsentBanner';
import { CookieSettingsModal } from '@/presentation/shared/components/CookieSettingsModal';

export function ShopClientLayout() {
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);

  const handleOpenCookieSettings = () => {
    setIsCookieSettingsOpen(true);
  };

  return (
    <>
      <Footer onSettingsClick={handleOpenCookieSettings} />
      <CookieConsentBanner onSettingsClick={handleOpenCookieSettings} />
      <CookieSettingsModal 
        isOpen={isCookieSettingsOpen} 
        onOpenChange={setIsCookieSettingsOpen} 
      />
    </>
  );
}
