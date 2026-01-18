'use client';

import React from 'react';
import { useTranslation } from '@/presentation/hooks';

interface SalesData {
    name: string;
    total: number;
}

interface SalesChartUIProps {
    data: SalesData[];
    title: string;
}

export const SalesChartUI: React.FC<SalesChartUIProps> = ({ data, title }) => {
    const SVG_WIDTH = 500;
    const SVG_HEIGHT = 250;
    const margin = { top: 20, right: 0, bottom: 30, left: 35 };
    const width = SVG_WIDTH - margin.left - margin.right;
    const height = SVG_HEIGHT - margin.top - margin.bottom;

    const maxValue = Math.ceil(Math.max(...data.map(d => d.total)) / 1000) * 1000;
    const numGridLines = 5;

    return (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm h-full">
            <style>{`
                @keyframes grow-bar {
                    from { transform: scaleY(0); }
                    to { transform: scaleY(1); }
                }
                .bar-animate {
                    transform-origin: bottom;
                    animation: grow-bar 0.8s ease-out forwards;
                }
            `}</style>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="h-[250px]">
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-full">
                    <g transform={`translate(${margin.left}, ${margin.top})`}>
                        {/* Grid lines and Y-axis */}
                        <line x1="0" y1="0" x2="0" y2={height} className="stroke-current text-border" />
                        {[...Array(numGridLines + 1)].map((_, i) => {
                            const y = (height / numGridLines) * i;
                            const labelValue = maxValue - (maxValue / numGridLines) * i;
                            return (
                                <g key={i}>
                                    <line x1="0" y1={y} x2={width} y2={y} strokeDasharray="2 2" className="stroke-current text-border" />
                                    <text x="-5" y={y + 3} textAnchor="end" className="text-xs fill-current text-muted-foreground">
                                        {`${Math.round(labelValue / 1000)}k`}
                                    </text>
                                </g>
                            );
                        })}
                        <line x1="0" y1={height} x2={width} y2={height} className="stroke-current text-border" />

                        {/* Bars and X-axis labels */}
                        {data.map((item, index) => {
                            const barWidth = width / data.length * 0.7;
                            const barX = (width / data.length) * index + (width / data.length - barWidth) / 2;
                            const barHeight = (item.total / maxValue) * height;

                            return (
                                <g key={index} className="group">
                                    <rect
                                        x={barX}
                                        y={height - barHeight}
                                        width={barWidth}
                                        height={barHeight}
                                        className="fill-current text-primary/20 group-hover:text-primary/40 transition-colors bar-animate"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                        rx="2"
                                    />
                                    <text x={barX + barWidth / 2} y={height - barHeight - 5} textAnchor="middle" className="text-xs fill-current text-foreground font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                        ${item.total.toLocaleString()}
                                    </text>
                                    <text x={barX + barWidth / 2} y={height + 15} textAnchor="middle" className="text-xs fill-current text-muted-foreground">
                                        {item.name}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>
        </div>
    );
};

interface SalesChartProps {
    data: SalesData[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    const { t } = useTranslation();
    return <SalesChartUI data={data} title={t('dashboard_monthly_sales')} />;
};
