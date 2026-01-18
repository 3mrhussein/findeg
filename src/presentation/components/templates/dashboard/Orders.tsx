import React from 'react';
import { useTranslation, usePagination } from '@/presentation/hooks';
import { orders as allOrders } from '@/lib/constants';
import { OrderTable } from '@/presentation/components/features/dashboard/OrderTable';
import { Pagination } from '@/presentation/components/shared/Pagination';
import { Card, CardContent } from '@/presentation/components/ui/card';

export const Orders: React.FC = () => {
    const { t } = useTranslation();
    const {
        currentPage,
        totalPages,
        currentPageData,
        setCurrentPage,
    } = usePagination(allOrders, 10);

    return (
        <>
            <Card>
                <CardContent className="p-0">
                    <OrderTable orders={currentPageData} />
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
