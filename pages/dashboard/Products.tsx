import React from 'react';
import { useTranslation, usePagination } from '../../hooks';
import { Button } from '../../components/ui/button';
import { Icon } from '../../components/atoms/Icon';
import { products as allProducts } from '../../constants';
import { ProductTable } from '../../components/organisms/ProductTable';
import { Pagination } from '../../components/molecules/Pagination';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

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