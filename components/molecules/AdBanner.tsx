'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { useTranslation } from '@/hooks';

interface AdBannerUIProps {
    className?: string;
    title: string;
    subtitle: string;
    ctaText: string;
    onCtaClick: () => void;
}

export const AdBannerUI: React.FC<AdBannerUIProps> = ({ className = '', title, subtitle, ctaText, onCtaClick }) => {
    return (
        <div className={`bg-secondary/10 dark:bg-secondary/20 rounded-lg p-8 ${className}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-bold text-secondary-dark dark:text-secondary">{title}</h3>
                    <p className="text-muted-foreground mt-1">{subtitle}</p>
                </div>
                <Button variant="secondary" size="lg" onClick={onCtaClick} className="shrink-0">
                    {ctaText}
                </Button>
            </div>
        </div>
    );
};

interface AdBannerProps {
    className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ className }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const handleCtaClick = () => {
        router.push('/shop');
    };

    return (
        <AdBannerUI
            className={className}
            title={t('ad_banner_title')}
            subtitle={t('ad_banner_subtitle')}
            ctaText={t('ad_banner_cta')}
            onCtaClick={handleCtaClick}
        />
    );
};