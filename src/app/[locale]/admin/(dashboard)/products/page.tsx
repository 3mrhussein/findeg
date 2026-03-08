import { getServices } from "@/server/getServices";
import { ProductTable } from "./ProductTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { resolveLocale } from "@/features/core/domain/value-objects";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">📦 Products</h2>
          <Badge variant="secondary" className="text-base px-2 py-0.5">
            {total}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/admin/products/import">
              <Upload className="mr-2 h-4 w-4" />
              ⬆️ Bulk Import
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Link>
          </Button>
        </div>
      </div>

      <ProductTable
        data={products}
        page={page}
        limit={limit}
        total={total}
        filters={{
          search,
          categoryId,
          brandId,
          isActive: query.isActive || "all",
        }}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        brands={brands.map((brand) => ({ id: brand.id, name: brand.name }))}
      />
    </div>
  );
}
