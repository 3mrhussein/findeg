'use client';

import React from 'react';
import { Button } from '@/presentation/shared/ui/button';

interface Variant {
    name: string;
    options: { value: string, stock: number }[];
}

interface VariantSelectorProps {
    variant: Variant;
    selectedValue: string;
    onValueChange: (value: string) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({ variant, selectedValue, onValueChange }) => {
    
    // Auto-select first available option if none is selected
    React.useEffect(() => {
        if (!selectedValue) {
            const firstAvailable = variant.options.find(opt => opt.stock > 0);
            if(firstAvailable) {
                onValueChange(firstAvailable.value);
            }
        }
    }, [selectedValue, onValueChange, variant.options]);

    return (
        <div className="mb-6">
            <h4 className="font-semibold mb-3">{variant.name}: <span className="text-muted-foreground font-normal">{selectedValue}</span></h4>
            <div className="flex items-center gap-2">
                {variant.options.map(option => (
                    <Button
                        key={option.value}
                        onClick={() => onValueChange(option.value)}
                        disabled={option.stock === 0}
                        variant={selectedValue === option.value ? 'default' : 'outline'}
                        size="sm"
                    >
                        {option.value}
                    </Button>
                ))}
            </div>
        </div>
    );
};