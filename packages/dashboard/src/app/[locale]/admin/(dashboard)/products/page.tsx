import { Suspense } from "react";
import { resolveLocale } from "@backend/features/core";
import { getTranslations } from "next-intl/server";
import { ProductListSkeleton } from "@components/skeletons";
import type { ProductListFilters } from "@backend/features/administration";
import { ProductsContent } from "./_components/ProductsContent";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const query = await searchParams;

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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductsContent locale={locale} filters={filters} />
      </Suspense>
    </div>
  );
}
