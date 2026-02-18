import React from "react";
import { DashboardContent } from "./DashboardContent";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { Order } from "@/features/order/domain/entities/Order";

interface DashboardTemplateProps {
  products: Product[];
  orders: Order[];
}

/**
 *
 */
const DashboardTemplate: React.FC<DashboardTemplateProps> = ({ products, orders }) => {
  return <DashboardContent products={products} orders={orders} />;
};

export default DashboardTemplate;
