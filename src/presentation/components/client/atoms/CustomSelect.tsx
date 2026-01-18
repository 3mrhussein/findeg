'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@/presentation/components/server/atoms/Icon';

export interface CustomSelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: CustomSelectOption[];
    value: string;
    onChange: (value: string) => void;
    ariaLabel?: string;
    className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, ariaLabel, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOptionClick = (newValue: string) => {
        onChange(newValue);
        setIsOpen(false);
    };
    
    return (
        <div ref={selectRef} className={`relative ${className}`} >
            <button
                type="button"
                className="relative w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-left flex items-center justify-between focus:ring-2 focus:ring-primary focus:border-primary"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={ariaLabel}
            >
                <span className="truncate">{selectedOption?.label || 'Select...'}</span>
                <Icon name="chevronDown" className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <ul
                    className="absolute z-10 mt-1 w-full bg-card shadow-lg rounded-md py-1 text-base ring-1 ring-border ring-opacity-5 overflow-auto focus:outline-none sm:text-sm max-h-60"
                    tabIndex={-1}
                    role="listbox"
                    aria-label={ariaLabel}
                >
                    {options.map((option) => (
                        <li
                            key={option.value}
                            className={`cursor-pointer select-none relative py-2 px-4 hover:bg-muted ${option.value === value ? 'font-semibold text-primary' : 'font-normal'}`}
                            role="option"
                            aria-selected={option.value === value}
                            onClick={() => handleOptionClick(option.value)}
                        >
                            <span className="block truncate">{option.label}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
