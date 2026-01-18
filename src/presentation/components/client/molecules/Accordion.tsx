import React, { useState } from 'react';
import { Button } from '@/presentation/components/ui/button';
import { Icon } from '@/presentation/components/server/atoms/Icon';

interface AccordionItem {
    title: React.ReactNode;
    content: React.ReactNode;
}

interface AccordionProps {
    items: AccordionItem[];
    className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ items, className = '' }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={`border-t border-border ${className}`}>
            {items.map((item, index) => (
                <div key={index} className="border-b border-border">
                    <h2>
                        <Button
                            variant="ghost"
                            className="w-full flex justify-between !py-4 !px-0 text-left !font-semibold text-foreground hover:!bg-muted/50"
                            onClick={() => handleClick(index)}
                            aria-expanded={openIndex === index}
                            aria-controls={`accordion-content-${index}`}
                        >
                            <span>{item.title}</span>
                            <Icon
                                name="chevronDown"
                                className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                                    openIndex === index ? 'rotate-180' : ''
                                }`}
                            />
                        </Button>
                    </h2>
                    <div
                        id={`accordion-content-${index}`}
                        className={`grid transition-all duration-300 ease-in-out ${
                            openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                        aria-hidden={openIndex !== index}
                    >
                        <div className="overflow-hidden">
                            <div className="pr-4">
                                {item.content}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
