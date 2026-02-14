import { useTranslations } from "next-intl";
import { usePagination } from "@/hooks";
import { products as allProducts } from "@/lib/constants";
import { ProductTable } from "@/components/common/ProductTable";
import { Pagination } from "@/components/common/Pagination";
import { Card, CardContent } from "@/components/ui/card";

/**
 *
 */
export const Products: React.FC = () => {
  const t = useTranslations();
  const { currentPage, totalPages, currentPageData, setCurrentPage } = usePagination(
    allProducts,
    10,
  );

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <ProductTable products={currentPageData} />
        </CardContent>
      </Card>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </>
  );
};
