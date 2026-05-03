'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface DeviceData {
  name: string;
  value: number;
  color: string;
}

interface DeviceUsageChartUIProps {
  data: DeviceData[];
  title: string;
}

/**
 *
 */
export const DeviceUsageChartUI: React.FC<DeviceUsageChartUIProps> = ({ data, title }) => {
  const SVG_SIZE = 200;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm h-full">
      <style>{`
                @keyframes draw-pie {
                    to { stroke-dashoffset: 0; }
                }
                .pie-slice {
                    animation: draw-pie 1.5s ease-out forwards;
                }
            `}</style>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="relative w-48 h-48">
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const previousPercentages = data
                .slice(0, index)
                .reduce((sum, prev) => sum + (prev.value / total) * 100, 0);
              const offset = (previousPercentages / 100) * circumference;
              const dasharray = (percentage / 100) * circumference;

              return (
                <circle
                  key={item.name}
                  cx={SVG_SIZE / 2}
                  cy={SVG_SIZE / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="24"
                  strokeDasharray={`${dasharray} ${circumference}`}
                  strokeDashoffset={circumference}
                  transform={`rotate(${(offset / circumference) * 360}, ${SVG_SIZE / 2}, ${SVG_SIZE / 2})`}
                  className="pie-slice"
                  style={{ animationDelay: `${index * 200}ms` }}
                />
              );
            })}
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-semibold text-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface DeviceUsageChartProps {
  data: DeviceData[];
}

/**
 *
 */
export const DeviceUsageChart: React.FC<DeviceUsageChartProps> = ({ data }) => {
  const t = useTranslations();
  return <DeviceUsageChartUI data={data} title={t('Pages.Dashboard.DeviceUsage')} />;
};
