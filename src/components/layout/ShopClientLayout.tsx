'use client';

import React, { useState } from 'react';
import { Footer } from '@/components/organisms/Footer';
import { CookieConsentBanner } from '@/components/organisms/CookieConsentBanner';
import { CookieSettingsModal } from '@/components/organisms/CookieSettingsModal';

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
