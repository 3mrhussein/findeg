import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
    const variantStyles = {
        primary: 'bg-primary text-white',
        secondary: 'bg-secondary text-white',
    };

    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${variantStyles[variant]} ${className}`}>
            {children}
        </span>
    );
};