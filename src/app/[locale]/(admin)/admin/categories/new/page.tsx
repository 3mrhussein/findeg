import { getServices } from "@/server/getServices";
import { CategoryForm } from "../CategoryForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 *
 */
export default async function CreateCategoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { categories } = getServices();
  const allCategories = await categories.getAll(locale);

  // Transform for select
  const categoryOptions = allCategories.map((c) => ({
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
