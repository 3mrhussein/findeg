"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cookieSettings } from "@/lib/constants";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";

interface CookieSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 *
 */
export const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const t = useTranslations();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      try {
        const storedPrefs = localStorage.getItem("cookiePreferences");
        if (storedPrefs) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setPreferences(JSON.parse(storedPrefs));
        } else {
          const defaultPrefs = cookieSettings.reduce(
            (acc, setting) => {
              acc[setting.id] = !setting.isMutable;
              return acc;
            },
            {} as Record<string, boolean>,
          );
          setPreferences(defaultPrefs);
        }
      } catch (error) {
        console.error("Could not read from localStorage:", error);
      }
    }
  }, [isOpen]);

  /**
   *
   */
  const handleToggle = (id: string) => {
    setPreferences((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /**
   *
   */
  const handleSave = () => {
    try {
      localStorage.setItem("cookieConsent", "true");
      localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    } catch (error) {
      console.error("Could not write to localStorage:", error);
    }
    onOpenChange(false);
    // Hide the main consent banner if it's still visible
    const banner = document.querySelector(".cookie-consent-banner");
    if (banner) {
      (banner as HTMLElement).style.display = "none";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("Pages.Cookies.SettingsTitle")}</DialogTitle>
          <DialogDescription>{t("Pages.Cookies.SettingsDescription")}</DialogDescription>
        </DialogHeader>
        <Accordion type="multiple" className="w-full">
          {cookieSettings.map((setting) => (
            <AccordionItem value={setting.id} key={setting.id}>
              <AccordionTrigger>
                <span className="font-semibold">{t(setting.titleKey as any)}</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between py-2 border-b border-dashed">
                    <span className="text-sm font-medium">{t("Pages.Cookies.Enabled")}</span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={preferences[setting.id] || false}
                        onCheckedChange={() => handleToggle(setting.id)}
                        disabled={!setting.isMutable}
                        aria-label={setting.titleKey}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{setting.descriptionKey}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <DialogFooter>
          <Button onClick={handleSave} className="w-full">
            {t("Pages.Cookies.SettingsSave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
