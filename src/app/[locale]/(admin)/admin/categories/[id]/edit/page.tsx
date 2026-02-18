import { getServices } from "@/server/getServices";
import { CategoryForm } from "../../CategoryForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { resolveLocale } from "@/features/core/domain/value-objects";

/**
 *
 */
export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const resolvedLocale = resolveLocale(locale);
  const { adminCategory, categories } = getServices();
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) {
    notFound();
  }

  // We need to fetch the category WITH translations to populate the form fully
  // However, IAdminCategoryService interface is generic.
  // For now we'll fetch basic category data + maybe manually fetch translations or rely on getById(locale)
  // Actually, getById(id, locale) returns a Category entity which only has `name` and `description` for that ONE locale.
  // To edit ALL locales, we ideally need a method that returns all translations.
  // For MVP/Simplicity, we might just load ONLY the current locale data into the form,
  // or modify the repository to return raw data with all translations.
  // Given time constraints, let's just fetch for current locale and English (as fallback to populate form).

  // A better approach would be to have `getByIdWithTranslations` but we didn't add that to interface yet.

  // Workaround: Load English and Arabic versions separately to populate the form
  const [catEn, catAr, allCategories] = await Promise.all([
    // We rely on getById returning the translation for requested language
    categories.getById(categoryId, "en"),
    categories.getById(categoryId, "ar"),
    categories.getAll(resolvedLocale),
  ]);

  if (!catEn) {
    notFound();
  }

  // Construct initial data object that matches what CategoryForm expects
  const initialData = {
    id: catEn.id,
    slug: catEn.slug,
    parentId: catEn.parentId,
    icon: catEn.image, // mapping image to icon for now
    translations: [
      { language: "en", name: catEn.name, description: catEn.description },
      { language: "ar", name: catAr?.name || "", description: catAr?.description || "" },
    ],
  };

  const categoryOptions = allCategories
    .filter((c) => c.id !== categoryId) // Prevent selecting self as parent
    .map((c) => ({
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
