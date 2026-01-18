'use client';

import React from 'react';
import { useTranslation } from '@/presentation/shared/hooks';

interface DiscountBadgeUIProps {
  discountText: string;
  className?: string;
}

export const DiscountBadgeUI: React.FC<DiscountBadgeUIProps> = ({ discountText, className = '' }) => {
    return (
        <div className={`bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full ${className}`}>
            {discountText}
        </div>
    );
};

// FIX: Add container component to handle logic and provide props to UI component.
interface DiscountBadgeProps {
    price: number;
    strikePrice: number;
    className?: string;
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({ price, strikePrice, className }) => {
    const { t } = useTranslation();
    if (strikePrice <= price) return null;
    
    const discount = Math.round(((strikePrice - price) / strikePrice) * 100);
    const discountText = t('discount_badge', { percent: discount });
    
    return <DiscountBadgeUI discountText={discountText} className={className} />;
};
