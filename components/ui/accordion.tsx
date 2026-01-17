import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from '../atoms/Icon';

// --- Context for Accordion State ---
type AccordionContextType = {
  value: string | string[];
  type: 'single' | 'multiple';
  onValueChange: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextType | null>(null);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion root component');
  }
  return context;
};

// --- Context for AccordionItem Value ---
const AccordionItemContext = createContext<{ value: string } | null>(null);

const useAccordionItem = () => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionTrigger/Content must be used within an AccordionItem');
  }
  return context;
};

// --- Accordion Root Component ---
const Accordion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type?: 'single' | 'multiple';
    defaultValue?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    collapsible?: boolean;
  }
>(({ children, type = 'single', defaultValue, onValueChange, collapsible = false, className, ...props }, ref) => {
  const [value, setValue] = useState<string | string[]>(defaultValue || (type === 'multiple' ? [] : ''));

  const handleValueChange = useCallback((itemValue: string) => {
    let newValue: string | string[];
    if (type === 'single') {
      newValue = value === itemValue && collapsible ? '' : itemValue;
    } else {
      const newValues = Array.isArray(value) ? [...value] : [];
      const index = newValues.indexOf(itemValue);
      if (index > -1) {
        newValues.splice(index, 1);
      } else {
        newValues.push(itemValue);
      }
      newValue = newValues;
    }
    setValue(newValue);
    onValueChange?.(newValue);
  }, [type, value, collapsible, onValueChange]);

  const contextValue = React.useMemo(() => ({
    value,
    onValueChange: handleValueChange,
    type,
  }), [value, handleValueChange, type]);

  return (
    <AccordionContext.Provider value={contextValue}>
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
});
Accordion.displayName = 'Accordion';

// --- AccordionItem Component ---
const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
  <AccordionItemContext.Provider value={{ value }}>
    <div ref={ref} className={cn('border-b', className)} {...props} />
  </AccordionItemContext.Provider>
));
AccordionItem.displayName = 'AccordionItem';

// --- AccordionTrigger Component ---
const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { value, type, onValueChange } = useAccordion();
  const { value: itemValue } = useAccordionItem();
  
  const isOpen = type === 'multiple' && Array.isArray(value) ? value.includes(itemValue) : value === itemValue;

  return (
    <h3 className="flex m-0">
      <button
        ref={ref}
        type="button"
        aria-expanded={isOpen}
        data-state={isOpen ? 'open' : 'closed'}
        onClick={() => onValueChange(itemValue)}
        className={cn(
          'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
          className
        )}
        {...props}
      >
        {children}
        <Icon name="chevronDown" className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>
    </h3>
  );
});
AccordionTrigger.displayName = 'AccordionTrigger';

// --- AccordionContent Component ---
const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { value, type } = useAccordion();
  const { value: itemValue } = useAccordionItem();

  const isOpen = type === 'multiple' && Array.isArray(value) ? value.includes(itemValue) : value === itemValue;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={ref}
      data-state={isOpen ? 'open' : 'closed'}
      className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pb-4 pt-0', className)}>{children}</div>
    </div>
  );
});
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };