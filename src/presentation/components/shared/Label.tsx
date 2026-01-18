import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className, ...props }) => {
    const baseStyles = "block text-sm font-medium text-foreground mb-2";
    return <label className={`${baseStyles} ${className || ''}`} {...props} />;
};
