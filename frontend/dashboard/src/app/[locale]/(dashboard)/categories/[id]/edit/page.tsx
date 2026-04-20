import { CategoryForm } from "../../CategoryForm";
import { Card, CardContent, CardHeader, CardTitle } from "@findeg/ui";
import { notFound } from "next/navigation";
import { resolveLocale } from "@findeg/backend/features/core";
import { getCategoryById, getCategories } from "@data/categories/queries";

/**
 * Edit Category Page — Edit an existing category with translations
 */
export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const resolvedLocale = resolveLocale(locale);
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) {
    notFound();
  }

  // Fetch category details using data layer
  const category = await getCategoryById(categoryId, resolvedLocale);

  if (!category) {
    notFound();
  }

  // Fetch all categories for parent selection
  const allCategories = await getCategories(resolvedLocale);

  // Construct initial data object that matches what CategoryForm expects
  const initialData = {
    id: category.id,
    slug: category.slug,
    parentId: category.parentId,
    icon: category.image, // mapping image to icon for now
    translations: (category as any).translations || [
      { language: "en", name: category.name || "", description: category.description || "" },
      { language: "ar", name: "", description: "" },
    ],
  };

  const categoryOptions = allCategories
    .filter((c: any) => c.id !== categoryId) // Prevent selecting self as parent
    .map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
    }));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Category</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm initialData={initialData} categories={categoryOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
