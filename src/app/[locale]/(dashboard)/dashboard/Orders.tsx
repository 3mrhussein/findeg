import { usePagination } from "@/hooks";
import { OrderTable } from "./OrderTable";
import { Pagination } from "@/components/common/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import type { Order } from "@/features/order/domain/entities/Order";

interface OrdersProps {
  orders: Order[];
}

/**
 *
 */
export const Orders: React.FC<OrdersProps> = ({ orders }) => {
  const { currentPage, totalPages, currentPageData, setCurrentPage } = usePagination(orders, 10);

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
