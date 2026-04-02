import { getServices } from "@/server/getServices";
import { ProductsClient } from "./_components/ProductsClient";
import { resolveLocale } from "@/features/core/domain/value-objects";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/app/[locale]/admin/_components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { ProductListFilters } from "@/features/administration/application/interfaces";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const query = await searchParams;
  const t = await getTranslations("Administration.Catalog.Products");

  const { adminCategory, adminBrand, adminProduct } = getServices();

  // Parse filters from URL
  const filters: ProductListFilters = {
    search: typeof query.search === "string" ? query.search : undefined,
    categoryIds:
      typeof query.categoryIds === "string" ? query.categoryIds.split(",").map(Number) : undefined,
    brandIds:
      typeof query.brandIds === "string" ? query.brandIds.split(",").map(Number) : undefined,
    status: query.status === "active" || query.status === "inactive" ? query.status : undefined,
    completeness: typeof query.completeness === "string" ? (query.completeness as any) : undefined,
    page: query.page ? Number(query.page) : 1,
    pageSize: query.pageSize ? Number(query.pageSize) : 20,
    sortBy: typeof query.sortBy === "string" ? (query.sortBy as any) : "updatedAt",
    sortDir: query.sortDir === "asc" ? "asc" : "desc",
  };

  const [initialData, categories, brands] = await Promise.all([
    adminProduct.getProductsList(filters),
    adminCategory.getAll(resolvedLocale),
    adminBrand.getAll(true),
  ]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title={t("Title")}
        description={`${initialData.total} products in catalog`}
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 me-2" />
              {t("AddProduct")}
            </Link>
          </Button>
        }
      />

      <ProductsClient
        initialData={initialData}
        categories={categories}
        brands={brands}
        initialFilters={filters}
      />
    </div>
  );
}
