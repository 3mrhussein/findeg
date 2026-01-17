import { useState, useMemo, useEffect } from 'react';

export const usePagination = <T,>(data: T[], itemsPerPage: number) => {
    const [currentPage, setCurrentPage] = useState(1);
    
    const totalPages = useMemo(() => {
        if (data.length === 0) return 1;
        return Math.ceil(data.length / itemsPerPage);
    }, [data.length, itemsPerPage]);

    const currentPageData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    }, [data, currentPage, itemsPerPage]);

    const nextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const prevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };
    
    // Reset to page 1 if data changes and current page becomes invalid
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);


    return {
        currentPage,
        totalPages,
        setCurrentPage,
        nextPage,
        prevPage,
        currentPageData,
    };
};
