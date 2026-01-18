'use client';

import React, { useRef, useEffect } from 'react';
import { useTranslation } from '@/presentation/hooks';

interface ActivityData {
    day: string;
    users: number;
}

interface UserActivityChartUIProps {
    data: ActivityData[];
    title: string;
}

export const UserActivityChartUI: React.FC<UserActivityChartUIProps> = ({ data, title }) => {
    const lineRef = useRef<SVGPolylineElement>(null);

    useEffect(() => {
        if (lineRef.current) {
            const length = lineRef.current.getTotalLength();
            lineRef.current.style.strokeDasharray = `${length}`;
            lineRef.current.style.strokeDashoffset = `${length}`;
        }
    }, [data]);

    const SVG_WIDTH = 500;
    const SVG_HEIGHT = 250;
    const margin = { top: 20, right: 20, bottom: 30, left: 35 };
    const width = SVG_WIDTH - margin.left - margin.right;
    const height = SVG_HEIGHT - margin.top - margin.bottom;

    const maxValue = Math.ceil(Math.max(...data.map(d => d.users)) / 50) * 50;
    const numGridLines = 5;
    
    const points = data.map((point, i) => {
        const x = (width / (data.length - 1)) * i;
        const y = height - (point.users / maxValue) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
             <style>{`
                @keyframes draw-line {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
                .line-animate {
                    animation: draw-line 1.5s ease-out forwards;
                }
                 @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .point-animate {
                    animation: fade-in 0.5s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="h-64">
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
                                        {labelValue}
                                    </text>
                                </g>
                            );
                        })}
                        <line x1="0" y1={height} x2={width} y2={height} className="stroke-current text-border" />

                        {/* X-axis labels */}
                        {data.map((item, i) => (
                            <text key={i} x={(width / (data.length - 1)) * i} y={height + 15} textAnchor="middle" className="text-xs fill-current text-muted-foreground">{item.day}</text>
                        ))}
                        
                        {/* Line */}
                        <polyline
                            ref={lineRef}
                            fill="none"
                            className="stroke-primary line-animate"
                            strokeWidth="2"
                            points={points}
                        />

                        {/* Data Points */}
                        {data.map((point, i) => {
                            const x = (width / (data.length - 1)) * i;
                            const y = height - (point.users / maxValue) * height;
                            return (
                               <g key={i} className="group point-animate" style={{ animationDelay: `${1000 + i * 100}ms`}}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="4"
                                        className="fill-primary stroke-card group-hover:fill-secondary"
                                        strokeWidth="2"
                                    />
                                    <text x={x} y={y - 10} textAnchor="middle" className="text-xs fill-current text-foreground opacity-0 group-hover:opacity-100 transition-opacity">{point.users}</text>
                               </g>
                            )
                        })}
                    </g>
                </svg>
            </div>
        </div>
    );
};

interface UserActivityChartProps {
    data: ActivityData[];
}

export const UserActivityChart: React.FC<UserActivityChartProps> = ({ data }) => {
    const { t } = useTranslation();
    return <UserActivityChartUI data={data} title={t('dashboard_weekly_activity')} />;
};
