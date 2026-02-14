import { useTranslations } from "next-intl";

import { usePagination } from "@/hooks";
import { orders as allOrders } from "@/lib/constants";
import { OrderTable } from "./OrderTable";
import { Pagination } from "@/components/common/Pagination";
import { Card, CardContent } from "@/components/ui/card";

/**
 *
 */
export const Orders: React.FC = () => {
  const t = useTranslations();
  const { currentPage, totalPages, currentPageData, setCurrentPage } = usePagination(allOrders, 10);

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <OrderTable orders={currentPageData} />
        </CardContent>
      </Card>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </>
  );
};
