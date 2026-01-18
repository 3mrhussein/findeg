
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from '../atoms/Icon';

type SelectContextProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    value?: string;
    onValueChange: (value: string) => void;
    optionsRef: React.MutableRefObject<Map<string, React.ReactNode>>;
};

const SelectContext = createContext<SelectContextProps | null>(null);

function useSelect() {
    const context = useContext(SelectContext);
    if (!context) {
        throw new Error('Select components must be used within a Select provider');
    }
    return context;
}

const Select = ({
    value,
    onValueChange,
    children,
}: {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const optionsRef = useRef(new Map<string, React.ReactNode>());
    const selectRef = useRef<HTMLDivElement>(null);

    const handleValueChange = (newValue: string) => {
        onValueChange?.(newValue);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const contextValue = {
        isOpen,
        setIsOpen,
        value,
        onValueChange: handleValueChange,
        optionsRef,
    };

    return (
        <SelectContext.Provider value={contextValue}>
            <div ref={selectRef} className="relative">{children}</div>
        </SelectContext.Provider>
    );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, children, ...props }, ref) => {
        const { isOpen, setIsOpen } = useSelect();
        return (
            <button
                ref={ref}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex h-9 w-full items-center justify-between rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                {...props}
            >
                {children}
                <Icon name="chevronDown" className={cn('h-4 w-4 opacity-50 transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>
        );
    }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
    const { value, optionsRef } = useSelect();
    const displayValue = value ? optionsRef.current.get(value) : null;
    return <>{displayValue || placeholder}</>;
};

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        const { isOpen } = useSelect();
        if (!isOpen) return null;
        return (
            <div
                ref={ref}
                className={cn(
                    'absolute z-50 mt-1 w-full rounded-md border bg-card text-card-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
    ({ className, children, value, ...props }, ref) => {
        const { value: selectedValue, onValueChange, optionsRef } = useSelect();

        useEffect(() => {
            optionsRef.current.set(value, children);
            return () => {
                optionsRef.current.delete(value);
            };
        }, [value, children, optionsRef]);
        
        const isSelected = selectedValue === value;

        return (
            <div
                ref={ref}
                onClick={() => onValueChange(value)}
                className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-3 text-sm outline-none hover:bg-muted focus:bg-muted',
                    isSelected && 'font-semibold text-primary',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
