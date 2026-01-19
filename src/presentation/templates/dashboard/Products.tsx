import { useTranslations } from 'next-intl';
import { T } from '@/i18n/content';
import { usePagination } from '@/presentation/shared/hooks';
import { products as allProducts } from '@/lib/constants';
import { ProductTable } from '@/presentation/features/shop/components/ProductTable';
import { Pagination } from '@/presentation/shared/components/Pagination';
import { Card, CardContent } from '@/presentation/shared/ui/card';

export const Products: React.FC = () => {
    const t = useTranslations();
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
