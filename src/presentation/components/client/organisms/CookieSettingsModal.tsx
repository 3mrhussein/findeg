'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/presentation/components/ui/button';
import { cookieSettings } from '@/lib/constants';
import { useTranslation } from '@/presentation/hooks';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/presentation/components/ui/accordion';
import { Switch } from '@/presentation/components/ui/switch';

interface CookieSettingsModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ isOpen, onOpenChange }) => {
    const { t } = useTranslation();
    const [preferences, setPreferences] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isOpen) {
            try {
                const storedPrefs = localStorage.getItem('cookiePreferences');
                if (storedPrefs) {
                    setPreferences(JSON.parse(storedPrefs));
                } else {
                    const defaultPrefs = cookieSettings.reduce((acc, setting) => {
                        acc[setting.id] = !setting.isMutable;
                        return acc;
                    }, {} as Record<string, boolean>);
                    setPreferences(defaultPrefs);
                }
            } catch (error) {
                console.error("Could not read from localStorage:", error);
            }
        }
    }, [isOpen]);

    const handleToggle = (id: string) => {
        setPreferences(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSave = () => {
        try {
            localStorage.setItem('cookieConsent', 'true');
            localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        } catch (error) {
            console.error("Could not write to localStorage:", error);
        }
        onOpenChange(false);
        // Hide the main consent banner if it's still visible
        const banner = document.querySelector('.cookie-consent-banner');
        if (banner) {
          (banner as HTMLElement).style.display = 'none';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('cookie_settings_title')}</DialogTitle>
                    <DialogDescription>{t('cookie_settings_description')}</DialogDescription>
                </DialogHeader>
                <Accordion type="multiple" className="w-full">
                    {cookieSettings.map(setting => (
                         <AccordionItem value={setting.id} key={setting.id}>
                            <AccordionTrigger>
                                <div className="flex items-center justify-between w-full pr-4">
                                    <span className="font-semibold">{t(setting.titleKey as any)}</span>
                                     <div onClick={(e) => e.stopPropagation()}>
                                        <Switch 
                                            checked={preferences[setting.id] || false}
                                            onCheckedChange={() => handleToggle(setting.id)}
                                            disabled={!setting.isMutable}
                                            aria-label={t(setting.titleKey as any)}
                                        />
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>{t(setting.descriptionKey as any)}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <DialogFooter>
                    <Button onClick={handleSave} className="w-full">{t('cookie_settings_save')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};