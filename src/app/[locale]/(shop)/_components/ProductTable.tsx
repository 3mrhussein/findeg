"use client";

import React from "react";
import type { Product } from "@/domain/entities/Product";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/Icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductTableUIProps {
  products: Product[];
  t: (key: any) => string;
  getStock: (product: Product) => number;
}

/**
 *
 */
export const ProductTableUI: React.FC<ProductTableUIProps> = ({ products, t, getStock }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>{t("Pages.Dashboard.Table.ProductName")}</TableHead>
        <TableHead>{t("Pages.Dashboard.Table.Category")}</TableHead>
        <TableHead>{t("Pages.Dashboard.Table.Price")}</TableHead>
        <TableHead>{t("Pages.Dashboard.Table.Stock")}</TableHead>
        <TableHead>{t("Pages.Dashboard.Table.Actions")}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {products.map((product) => (
        <TableRow key={product.id}>
          <TableCell className="font-medium text-foreground">{product.name}</TableCell>
          <TableCell>{product.category}</TableCell>
          <TableCell>${product.price.toFixed(2)}</TableCell>
          <TableCell>{getStock(product)}</TableCell>
          <TableCell className="flex gap-2">
            <Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`}>
              <Icon name="pen" className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
              aria-label={`Delete ${product.name}`}
            >
              <Icon name="trash" className="w-4 h-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

interface ProductTableProps {
  products: Product[];
}

/**
 *
 */
export const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const t = useTranslations();
  /**
   *
   */
  const getStock = (product: Product) => {
    if (!product.variants) return 10; // Mock stock for non-variant products
    return Object.values(product.variants)
      .flatMap((v) => v.options)
      .reduce((sum, opt) => sum + opt.stock, 0);
  };
  return <ProductTableUI products={products} t={t} getStock={getStock} />;
};
