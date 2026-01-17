import React from 'react';

interface IndicatorCircleProps {
    count: number;
    className?: string;
}

export const IndicatorCircle: React.FC<IndicatorCircleProps> = ({ count, className = '' }) => {
    return (
        <span className={`absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-secondary text-white text-xs font-bold border-2 border-card ${className}`}>
            {count}
        </span>
    );
};