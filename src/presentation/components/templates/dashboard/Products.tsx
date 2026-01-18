import React from 'react';
import { useTranslation, usePagination } from '@/presentation/hooks';
import { products as allProducts } from '@/lib/constants';
import { ProductTable } from '@/presentation/components/features/shop/ProductTable';
import { Pagination } from '@/presentation/components/shared/Pagination';
import { Card, CardContent } from '@/presentation/components/ui/card';

export const Products: React.FC = () => {
    const { t } = useTranslation();
    const {
        currentPage,
        totalPages,
        currentPageData,
        setCurrentPage,
    } = usePagination(allProducts, 10);

    return (
        <>
            <Card>
                <CardContent className="p-0">
                  <ProductTable products={currentPageData} />
                </CardContent>
            </Card>
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </>
    );
};
