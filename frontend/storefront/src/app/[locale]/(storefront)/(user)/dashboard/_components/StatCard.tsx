'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

/**
 * Overview stat card — instant value display, subtle hover elevation.
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">
          {prefix}
          {formattedValue}
          {suffix}
        </div>
      </CardContent>
    </Card>
  );
};
