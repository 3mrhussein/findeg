import { useTranslations } from "next-intl";
import { usePagination } from "@hooks/usePagination";
import { Pagination } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@findeg/ui";
import type { Product } from "@findeg/backend/features/catalog/domain/entities/Product";
// TODO: Replace with storefront-specific product display component
// import { ProductTable } from "@app/[locale]/admin/(dashboard)/_components/ProductTable";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your catalog, prices, and inventory.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            Showing {currentPageData.length} of {products.length} products.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* TODO: Implement storefront-specific product display */}
          <div className="p-4 text-muted-foreground">Product list coming soon...</div>
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
