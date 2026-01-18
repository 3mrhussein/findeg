import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

type TabsContextProps = {
    value: string;
    onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextProps | null>(null);

const useTabs = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider');
    }
    return context;
};

const Tabs = ({ defaultValue, children, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { defaultValue: string }) => {
    const [value, setValue] = useState(defaultValue);
    return (
        <TabsContext.Provider value={{ value, onValueChange: setValue }}>
            <div className={cn('w-full', className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
            className
        )}
        {...props}
    />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }>(({ className, value, ...props }, ref) => {
    const { value: activeValue, onValueChange } = useTabs();
    const isActive = activeValue === value;
    return (
        <button
            ref={ref}
            type="button"
            onClick={() => onValueChange(value)}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                isActive && 'bg-background text-foreground shadow',
                className
            )}
            {...props}
        />
    );
});
TabsTrigger.displayName = 'TabsTrigger';


const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(({ value, className, ...props }, ref) => {
    const { value: activeValue } = useTabs();
    if (activeValue !== value) return null;
    return (
        <div
            ref={ref}
            className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2', className)}
            {...props}
        />
    );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
