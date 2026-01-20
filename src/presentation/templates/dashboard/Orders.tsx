import { useTranslations } from 'next-intl';

import { usePagination } from '@/presentation/shared/hooks';
import { orders as allOrders } from '@/lib/constants';
import { OrderTable } from '@/presentation/features/dashboard/components/OrderTable';
import { Pagination } from '@/presentation/shared/components/Pagination';
import { Card, CardContent } from '@/presentation/shared/ui/card';

export const Orders: React.FC = () => {
    const t = useTranslations();
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
