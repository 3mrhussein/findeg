import { CategoryForm } from "../CategoryForm";
import { Card, CardContent, CardHeader, CardTitle } from "@ui";
import { resolveLocale } from "@backend/features/core";
import { getCategories } from "@data/categories/queries";

/**
 * Create Category Page — Create a new category with translations
 */
export default async function CreateCategoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);

  // Fetch all categories for parent selection dropdown
  const allCategories = await getCategories(resolvedLocale);

  // Transform for select
  const categoryOptions = allCategories.map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
  }));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Category</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm categories={categoryOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
