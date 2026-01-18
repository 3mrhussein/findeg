'use client';

import React, { useState } from 'react';
import { Footer } from '@/presentation/components/layout/Footer';
import { CookieConsentBanner } from '@/presentation/components/shared/CookieConsentBanner';
import { CookieSettingsModal } from '@/presentation/components/shared/CookieSettingsModal';

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
