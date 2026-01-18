'use client';

import React from 'react';
import { useCountUp } from '@/presentation/hooks/useCountUp';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, prefix = '', suffix = '', decimals = 0 }) => {
    const animatedValue = useCountUp(value, 2000);

    const formattedValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(animatedValue);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-foreground">
                    {prefix}{formattedValue}{suffix}
                </div>
            </CardContent>
        </Card>
    );
};
