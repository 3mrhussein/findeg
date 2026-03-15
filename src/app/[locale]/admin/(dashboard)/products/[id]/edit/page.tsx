import { getServices } from "@/server/getServices";
import { ProductEditForm } from "./_components/ProductEditForm";
import { notFound, redirect } from "next/navigation";
import { resolveLocale } from "@/features/core/domain/value-objects";
import { updateProductAction } from "@/features/catalog/application/actions/product";
import type { ProductFormValues } from "@/features/administration/presentation/forms/product-form";
import { PageHeader } from "@/app/[locale]/admin/_components/shared/PageHeader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * /admin/products/[id]/edit
 * Edit an existing product with the redesigned tabbed ProductEditForm.
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const resolvedLocale = resolveLocale(locale);
  const { adminProduct, adminCategory, adminBrand, adminTag } = getServices();
  const productId = parseInt(id);

  if (isNaN(productId)) notFound();

  const [categories, brands, tags, product] = await Promise.all([
    adminCategory.getAll(resolvedLocale),
    adminBrand.getAll(true),
    adminTag.getAll(),
    adminProduct.getById(productId, resolvedLocale),
  ]);

  if (!product) notFound();

  // Server action for form submission
  async function handleUpdateProduct(data: ProductFormValues) {
    "use server";

    // Map form values to ProductInput
    const input = {
      localizedName: data.localizedName,
      localizedDescription: data.localizedDescription,
      localizedLongDescription: data.localizedLongDescription,
      categoryId: data.categoryId,
      brandId: data.brandId,
      isActive: data.isActive,
      sku: data.sku,
      tagIds: data.tagIds,
      variants: data.variants,
      localizedMetaTitle: data.localizedMetaTitle,
      localizedMetaDescription: data.localizedMetaDescription,
    };

    const result = await updateProductAction(productId, input as any);

    if (result.success) {
      redirect(`/admin/products/${productId}/edit?saved=true`);
    } else {
      // TODO: Handle error - for now just log it
      console.error("Update failed:", result.error);
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Back to Products Link */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4 me-2" />
            Back to Products
          </Link>
        </Button>
      </div>

      {/* Page Header */}
      <PageHeader title={`Edit: ${product.name}`} description={`Product ID: #${productId}`} />

      {/* Edit Form */}
      <ProductEditForm
        product={product}
        categories={categories.map((c: any) => ({ id: c.id, name: c.name }))}
        brands={brands.map((b: any) => ({ id: b.id, name: b.name }))}
        allTags={tags.map((t: any) => ({
          id: t.id,
          name: t.key,
          nameAr: t.key,
          color: t.color || undefined,
        }))}
        onSubmit={handleUpdateProduct}
      />
    </div>
  );
}
