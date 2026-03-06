import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { ProductForm } from "../ProductForm";
import { Suspense } from "react";

/**
 *
 */
/**
 *
 */
export default async function NewProductPage() {
  const categoriesPromise = container.adminCategoryService.getAll().then((c) =>
    c.map((x) => ({
      id: x.id,
      slug: x.slug,
      name: x.name,
    })),
  );

  const brandsPromise = container.adminBrandService.getAll().then((b) =>
    b.map((x) => ({
      id: x.id,
      name: x.name,
    })),
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Product</h2>
      </div>
      <div className="max-w-2xl">
        <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-lg bg-muted" />}>
          <ProductForm categoriesPromise={categoriesPromise} brandsPromise={brandsPromise} />
        </Suspense>
      </div>
    </div>
  );
}
