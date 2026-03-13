import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { ProductForm } from "@/features/administration/presentation/components/catalog/ProductForm";
import { resolveLocale } from "@/features/core/domain/value-objects";

/**
 * /admin/products/new
 * Create a new product with the redesigned ProductForm.
 */
export default async function NewProductPage() {
  const [categoriesRaw, brandsRaw] = await Promise.all([
    container.adminCategoryService.getAll(),
    container.adminBrandService.getAll(),
  ]);

  const categories = categoriesRaw.map((c) => ({ id: c.id, name: c.name }));
  const brands = brandsRaw.map((b) => ({ id: b.id, name: b.name }));

  return (
    <div className="flex-1 space-y-6 p-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">New Product</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below. Variants are optional — simple products get one default
            variant.
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <ProductForm mode="create" categories={categories} brands={brands} />
      </div>
    </div>
  );
}
