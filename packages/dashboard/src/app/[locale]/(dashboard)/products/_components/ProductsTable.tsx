"use client";

import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui";
import { Checkbox } from "@ui";
import { ProductRow } from "./ProductRow";
import type { ProductListItem } from "@backend/features/administration";

interface ProductsTableProps {
  products: ProductListItem[];
  total: number;
  selectedIds: number[];
  onSelectChange: (ids: number[]) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ProductsTable({
  products,
  selectedIds,
  onSelectChange,
  onDuplicate,
  onDelete,
}: ProductsTableProps) {
  const t = useTranslations("Administration.Catalog.Products");

  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const partialSelected = selectedIds.length > 0 && selectedIds.length < products.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectChange(products.map((p) => p.id));
    } else {
      onSelectChange([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      onSelectChange([...selectedIds, id]);
    } else {
      onSelectChange(selectedIds.filter((sid) => sid !== id));
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/30">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected || (partialSelected ? "indeterminate" : false)}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>{t("Table.Product")}</TableHead>
            <TableHead className="hidden lg:table-cell">
              {t("Table.Category")} / {t("Table.Brand")}
            </TableHead>
            <TableHead>{t("Table.Price")}</TableHead>
            <TableHead>{t("Table.Stock")}</TableHead>
            <TableHead className="hidden md:table-cell">{t("Table.Status")}</TableHead>
            <TableHead className="hidden xl:table-cell">{t("Table.LastUpdated")}</TableHead>
            <TableHead className="text-right w-[80px]">{t("Table.Actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                No products found.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                isSelected={selectedIds.includes(product.id)}
                onSelectChange={(checked) => handleSelectRow(product.id, checked)}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
