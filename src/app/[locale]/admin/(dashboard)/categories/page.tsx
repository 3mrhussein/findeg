import { getServices } from "@/server/getServices";
import { CategoryTree } from "./_components/CategoryTree";
import { PageHeader } from "@/app/[locale]/admin/_components/shared/PageHeader";
import { resolveLocale } from "@/features/core/domain/value-objects";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/features/catalog/application/actions/category";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Categories Page — Hierarchical tree view of product categories
 */
export default async function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const { adminCategory } = getServices();
  const categories = await adminCategory.getAll(resolvedLocale);

  // Server action for creating/updating categories
  async function handleSaveCategory(data: any, categoryId?: number) {
    "use server";

    const input = {
      localizedContent: {
        name: data.localizedName,
        description: data.localizedDescription,
      },
      parentId: data.parentId,
      icon: data.icon,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      // Auto-generate slug from name if not provided
      slug: data.localizedName?.en?.toLowerCase().replace(/\s+/g, "-") || "",
      name: data.localizedName?.en || "Untitled",
    };

    if (categoryId) {
      // Update existing category
      const result = await updateCategoryAction(categoryId, input as any);
      if (!result.success) {
        console.error("Update failed:", result.error);
        return;
      }
    } else {
      // Create new category
      const result = await createCategoryAction(input as any);
      if (!result.success) {
        console.error("Create failed:", result.error);
        return;
      }
    }

    revalidatePath(`/${locale}/admin/categories`);
  }

  // Server action for deleting categories
  async function handleDeleteCategory(categoryId: number) {
    "use server";

    const result = await deleteCategoryAction(categoryId);
    if (!result.success) {
      console.error("Delete failed:", result.error);
      return;
    }

    revalidatePath(`/${locale}/admin/categories`);
  }

  // Server action for reordering categories
  async function handleReorderCategories(reorderedCategories: any[]) {
    "use server";

    // TODO: Implement bulk reorder logic
    // For now, update sort order for each category
    for (let i = 0; i < reorderedCategories.length; i++) {
      const category = reorderedCategories[i];
      await updateCategoryAction(category.id, {
        sortOrder: i,
      } as any);
    }

    revalidatePath(`/${locale}/admin/categories`);
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <PageHeader
        title="Categories"
        description={`${categories.length} categories organized hierarchically`}
      />

      <CategoryTree
        categories={categories}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
        onReorder={handleReorderCategories}
      />
    </div>
  );
}
