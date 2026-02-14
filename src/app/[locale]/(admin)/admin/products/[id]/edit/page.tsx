import { getServices } from "@/server/getServices";
import { ProductForm } from "../../ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

/**
 *
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const { adminProduct, categories } = getServices();
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  const [product, allCategories] = await Promise.all([
    adminProduct.getById(productId, locale),
    categories.getAll(locale),
  ]);

  if (!product) {
    notFound();
  }

  // Transform categories for select
  const categoryOptions = allCategories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
  }));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm initialData={product} categories={categoryOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
