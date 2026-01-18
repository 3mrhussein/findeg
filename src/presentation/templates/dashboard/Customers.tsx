import React from 'react';
import { useTranslation } from '@/presentation/shared/hooks';

export const Customers: React.FC = () => {
    const { t } = useTranslation();
    return (
         <>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
                <p className="text-muted-foreground">Customer management feature coming soon.</p>
            </div>
        </>
    );
};
