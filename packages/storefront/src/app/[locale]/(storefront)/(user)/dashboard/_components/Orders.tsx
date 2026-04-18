import { usePagination } from "@hooks/usePagination";
import { OrderTable } from "./OrderTable";
import { Pagination } from "@ui";
import { Card, CardContent } from "@ui";
import type { Order } from "@backend/features/order/domain/entities/Order";

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
