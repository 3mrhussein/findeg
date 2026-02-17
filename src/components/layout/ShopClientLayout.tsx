"use client";

import React, { useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";
import { CookieSettingsModal } from "@/components/common/CookieSettingsModal";
import { Toaster } from "@/components/ui/toaster";

/**
 *
 */
export function ShopClientLayout() {
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);

  /**
   *
   */
  const handleOpenCookieSettings = () => {
    setIsCookieSettingsOpen(true);
  };

  return (
    <>
      <Footer onSettingsClick={handleOpenCookieSettings} />
      <CookieConsentBanner onSettingsClick={handleOpenCookieSettings} />
      <CookieSettingsModal isOpen={isCookieSettingsOpen} onOpenChange={setIsCookieSettingsOpen} />
      <Toaster />
    </>
  );
}
