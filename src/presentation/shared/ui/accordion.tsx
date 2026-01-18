import React from "react";

interface AccordionProps {
  children: React.ReactNode;
  type?: "single" | "multiple";
  collapsible?: boolean;
  className?: string;
  defaultValue?: string | string[];
}

interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
}

interface AccordionContentProps {
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ children }) => (
  <div className="space-y-1">
    {children}
  </div>
);

export const AccordionItem: React.FC<AccordionItemProps> = ({ children }) => (
  <div className="border-b">
    {children}
  </div>
);

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ children }) => (
  <button className="flex w-full items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180">
    {children}
    <svg className="h-4 w-4 shrink-0 transition-transform duration-200" viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  </button>
);

export const AccordionContent: React.FC<AccordionContentProps> = ({ children }) => (
  <div className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
    <div className="pb-4 pt-0">
      {children}
    </div>
  </div>
);
