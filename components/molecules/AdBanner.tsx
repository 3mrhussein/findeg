import React from 'react';
import type { PageProps } from '../../types';
import { Button } from '../ui/button';
import { useTranslation } from '../../hooks';

interface AdBannerUIProps extends PageProps {
    className?: string;
    title: string;
    subtitle: string;
    ctaText: string;
}

export const AdBannerUI: React.FC<AdBannerUIProps> = ({ navigateTo, className = '', title, subtitle, ctaText }) => {
    return (
        <div className={`bg-secondary/10 dark:bg-secondary/20 rounded-lg p-8 ${className}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-bold text-secondary-dark dark:text-secondary">{title}</h3>
                    <p className="text-muted-foreground mt-1">{subtitle}</p>
                </div>
                <Button variant="secondary" size="lg" onClick={() => navigateTo('shop')} className="shrink-0">
                    {ctaText}
                </Button>
            </div>
        </div>
    );
};

// FIX: Add container component to handle logic and provide props to UI component.
interface AdBannerProps extends PageProps {
    className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ navigateTo, className }) => {
    const { t } = useTranslation();

    return (
        <AdBannerUI
            navigateTo={navigateTo}
            className={className}
            title={t('ad_banner_title')}
            subtitle={t('ad_banner_subtitle')}
            ctaText={t('ad_banner_cta')}
        />
    );
};