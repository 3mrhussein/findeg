import React from 'react';
import { useTranslations } from 'next-intl';
import { T } from '@/i18n/content';

export const Customers: React.FC = () => {
    const t = useTranslations();
    return (
         <>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
                <p className="text-muted-foreground">{t(T.PAGES.DASHBOARD.CUSTOMERS_COMING_SOON)}</p>
            </div>
        </>
    );
};
