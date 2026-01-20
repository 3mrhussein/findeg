'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/presentation/shared/ui/button';
import { Container } from '@/presentation/shared/layout/Container';
import { useTranslations } from 'next-intl';

interface CookieConsentBannerUIProps {
    isVisible: boolean;
    onConsent: (acceptAll: boolean) => void;
    onSettingsClick: () => void;
    title: string;
    text: string;
    acceptText: string;
    rejectText: string;
    settingsText: string;
}

export const CookieConsentBannerUI: React.FC<CookieConsentBannerUIProps> = ({ 
    isVisible, 
    onConsent,
    onSettingsClick,
    title,
    text,
    acceptText,
    rejectText,
    settingsText,
}) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm z-50 border-t shadow-lg animate-slide-up">
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }
            `}</style>
            <Container className="py-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <h4 className="font-semibold">{title}</h4>
                        <p className="text-sm text-muted-foreground">{text}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                        <Button onClick={onSettingsClick} variant="ghost" size="sm" className="w-full sm:w-auto">{settingsText}</Button>
                        <Button onClick={() => onConsent(false)} variant="outline" size="sm" className="w-full sm:w-auto">{rejectText}</Button>
                        <Button onClick={() => onConsent(true)} size="sm" className="w-full sm:w-auto">{acceptText}</Button>
                    </div>
                </div>
            </Container>
        </div>
    );
};

interface CookieConsentBannerProps {
    onSettingsClick: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onSettingsClick }) => {
    const t = useTranslations();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        try {
            const consent = localStorage.getItem('cookieConsent');
            if (!consent) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsVisible(true);
            }
        } catch (error) {
            console.error("Could not read from localStorage:", error);
            setIsVisible(true); // Show if localStorage is not available
        }
    }, []);

    const handleConsent = (acceptAll: boolean) => {
        try {
            localStorage.setItem('cookieConsent', 'true');
            const preferences = { 
                required: true, 
                analytics: acceptAll, 
                marketing: acceptAll 
            };
            localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        } catch (error) {
            console.error("Could not write to localStorage:", error);
        }
        setIsVisible(false);
    };

    return (
        <CookieConsentBannerUI
            isVisible={isVisible}
            onConsent={handleConsent}
            onSettingsClick={onSettingsClick}
            title={t('Pages.Cookies.ConsentTitle')}
            text={t('Pages.Cookies.ConsentText')}
            acceptText={t('Pages.Cookies.ConsentAccept')}
            rejectText={t('Pages.Cookies.ConsentReject')}
            settingsText={t('Pages.Cookies.ConsentSettingsBtn')}
        />
    );
};