import React from 'react';
import { useTranslations } from 'next-intl';

export const Customers: React.FC = () => {
    const t = useTranslations();
    return (
         <>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
                <p className="text-muted-foreground">{t('Pages.Dashboard.CustomersComingSoon')}</p>
            </div>
        </>
    );
};
