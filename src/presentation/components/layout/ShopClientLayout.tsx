'use client';

import React, { useState } from 'react';
import { Footer } from '@/presentation/components/client/organisms/Footer';
import { CookieConsentBanner } from '@/presentation/components/client/organisms/CookieConsentBanner';
import { CookieSettingsModal } from '@/presentation/components/client/organisms/CookieSettingsModal';

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
