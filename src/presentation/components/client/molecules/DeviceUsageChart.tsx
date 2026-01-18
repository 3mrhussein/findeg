import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';

interface ChartProps {
    data: any[];
}

export const DeviceUsageChart: React.FC<ChartProps> = ({ data }) => (
    <Card>
        <CardHeader><CardTitle>Device Usage</CardTitle></CardHeader>
        <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20">
                Chart Placeholder
            </div>
        </CardContent>
    </Card>
);
