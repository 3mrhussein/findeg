import { useTranslations } from "next-intl";
import { usePagination } from "@/hooks";
import { ProductTable } from "../../../(admin)/admin/_components/ProductTable";
import { Pagination } from "@/components/shared/Pagination";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Product } from "@/features/catalog/domain/entities/Product";

interface ProductsProps {
  products: Product[];
}

/**
 * Products Dashboard Page
 */
export const Products: React.FC<ProductsProps> = ({ products }) => {
  const t = useTranslations();
  const { currentPage, totalPages, currentPageData, setCurrentPage } = usePagination(products, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage your catalog, prices, and inventory.">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            Showing {currentPageData.length} of {products.length} products.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ProductTable products={currentPageData} />
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
