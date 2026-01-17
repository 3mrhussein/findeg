import React from 'react';
import { Button } from '../ui/button';
import { useTranslation } from '../../hooks';
import { Icon } from '../atoms/Icon';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const { t, language } = useTranslation();
    const isRtl = language === 'ar';
    const prevText = t('pagination_previous');
    const nextText = t('pagination_next');

    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };
    
    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    // Simple pagination logic: show first, last, current, and pages around current
    const getPageNumbers = () => {
        const pages = new Set<number>();
        pages.add(1);
        pages.add(totalPages);
        if (currentPage > 2) pages.add(currentPage - 1);
        pages.add(currentPage);
        if (currentPage < totalPages - 1) pages.add(currentPage + 1);

        const pageArray = Array.from(pages).sort((a, b) => a - b);
        const result: (number | string)[] = [];
        let lastPage = 0;

        for (const page of pageArray) {
            if (lastPage > 0 && page - lastPage > 1) {
                result.push('...');
            }
            result.push(page);
            lastPage = page;
        }
        return result;
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-8 flex justify-center items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrev} 
                disabled={currentPage === 1}
                className="gap-1"
            >
                <Icon name="chevronRight" className={`h-4 w-4 ${!isRtl ? 'rotate-180' : ''}`} />
                <span>{prevText}</span>
            </Button>
            
            <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers().map((page, index) => 
                    typeof page === 'number' ? (
                        <Button
                            key={`${page}-${index}`}
                            variant={currentPage === page ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => onPageChange(page)}
                            className="h-9 w-9"
                        >
                            {page}
                        </Button>
                    ) : (
                        <span key={`dots-${index}`} className="px-2 text-muted-foreground">...</span>
                    )
                )}
            </div>

            <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNext} 
                disabled={currentPage === totalPages}
                className="gap-1"
            >
                <span>{nextText}</span>
                <Icon name="chevronRight" className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Button>
        </div>
    );
};
