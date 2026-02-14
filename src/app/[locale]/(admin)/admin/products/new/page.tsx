import { container } from "@/infrastructure/di/ServiceContainer";
import { ProductForm } from "../ProductForm";

/**
 *
 */
export default async function NewProductPage() {
  const categories = await container.adminCategoryService.getAll();
  const brands = await container.adminBrandService.getAll();

  // Transform for Select
  const categoryOptions = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
  }));

  const brandOptions = brands.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Product</h2>
      </div>
      <div className="max-w-2xl">
        <ProductForm categories={categoryOptions} brands={brandOptions} />
      </div>
    </div>
  );
}
