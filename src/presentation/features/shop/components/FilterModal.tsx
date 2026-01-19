import React from 'react';
import { Button } from '@/presentation/shared/ui/button';
import { useTranslations } from 'next-intl';
import { T } from '@/i18n/content';
import { Icon } from '@/presentation/shared/components/Icon';

interface FilterModalUIProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
    viewResultsText: string;
}

export const FilterModalUI: React.FC<FilterModalUIProps> = ({ isOpen, onClose, children, title, viewResultsText }) => {
    if (!isOpen) {
        return null;
    }
    
    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex flex-col lg:hidden"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-md bg-card shadow-xl ml-auto h-full flex flex-col animate-slide-in-right rtl:animate-slide-in-left">
                <style>{`
                    @keyframes slide-in-right {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                    @keyframes slide-in-left {
                        from { transform: translateX(-100%); }
                        to { transform: translateX(0); }
                    }
                    .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
                    .animate-slide-in-left { animation: slide-in-left 0.3s ease-out; }
                `}</style>
                 <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <Button shape="circle" size="sm" variant="ghost" onClick={onClose} aria-label="Close filters">
                        <Icon name="x" className="w-6 h-6 text-foreground" />
                    </Button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {children}
                </div>
                <div className="p-4 border-t border-border">
                    <Button size="lg" className="w-full" onClick={onClose}>
                        {viewResultsText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// FIX: Add container component to handle logic and provide props to UI component.
interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const FilterModal: React.FC<FilterModalProps> = (props) => {
    const t = useTranslations();

    return <FilterModalUI 
        {...props}
        title={t(T.PAGES.SHOP.FILTERS_TITLE)}
        viewResultsText={t(T.PAGES.SHOP.VIEW_RESULTS)}
    />;
};
