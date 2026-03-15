import { getServices } from "@/server/getServices";
import { ProductsTable } from "./_components/ProductsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { resolveLocale } from "@/features/core/domain/value-objects";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/[locale]/admin/_components/shared/PageHeader";

/**
 *
 */
export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    categoryId?: string;
    brandId?: string;
    isActive?: string;
  }>;
}) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const query = await searchParams;
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
  const offset = (page - 1) * limit;
  const search = query.search?.trim() || "";
  const categoryId = query.categoryId ? Number(query.categoryId) : undefined;
  const brandId = query.brandId ? Number(query.brandId) : undefined;
  const isActive =
    query.isActive === "true" ? true : query.isActive === "false" ? false : undefined;

  const { repositories, adminCategory, adminBrand } = getServices();
  const [{ products, total }, categories, brands] = await Promise.all([
    repositories.products.getFiltered(
      {
        search: search || undefined,
        categoryId,
        brandId,
        isActive,
        limit,
        offset,
        sort: "newest",
      },
      resolvedLocale,
    ),
    adminCategory.getAll(resolvedLocale),
    adminBrand.getAll(true),
  ]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="Products"
        description={`${total} products in catalog`}
        actions={
          <>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4 me-2" />
                Create Product
              </Link>
            </Button>
          </>
        }
      />

      <ProductsTable
        products={products}
        total={total}
        categories={categories}
        brands={brands}
        currentSearch={search}
        currentCategoryId={categoryId}
        currentBrandId={brandId}
        currentIsActive={isActive}
        currentPage={page}
        currentLimit={limit}
      />
    </div>
  );
}
