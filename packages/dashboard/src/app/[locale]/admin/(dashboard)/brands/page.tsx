import { getTranslations, setRequestLocale } from "next-intl/server";
import { getServices } from "@/server/getServices";
import { BrandsManager } from "./_components/BrandsManager";
import {
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
  toggleBrandStatusAction,
} from "@/actions/admin-actions";

import { BrandInput } from "@/features/administration/domain/types";

/**
 *
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = (await (getTranslations as any)({
    locale,
    namespace: "Administration.Catalog.Brands",
  })) as any;
  return { title: `${t("Title")} | FindEg Admin` };
}

/**
 *
 */
export default async function BrandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as any);
  const t = await getTranslations("Administration.Catalog.Brands");
  const { adminBrand } = getServices();

  // Fetch all brands (optimized query with product counts included)
  const brands = await adminBrand.getAll();

  /**
   * Wrapper for Save (Create/Update)
   */
  const handleSave = async (data: BrandInput, id?: number) => {
    "use server";
    if (id) {
      return updateBrandAction(id, data);
    }
    return createBrandAction(data);
  };

  /**
   * Wrapper for Delete
   */
  const handleDelete = async (id: number) => {
    "use server";
    const { adminBrand } = getServices();

    // Check if brand can be deleted (no products)
    const productCount = await adminBrand.getBrandProductCount(id);
    if (productCount > 0) {
      return {
        success: false,
        error: "DELETE_BLOCKED",
        count: productCount,
      };
    }

    return deleteBrandAction(id);
  };

  /**
   * Wrapper for Toggle
   */
  const handleToggle = async (id: number) => {
    "use server";
    return toggleBrandStatusAction(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {t("Title")}
        </h1>
        <p className="text-muted-foreground text-sm font-medium">{t("Subtitle")}</p>
      </div>

      <BrandsManager
        initialBrands={brands}
        onSave={handleSave}
        onDelete={handleDelete}
        onToggleStatus={handleToggle}
      />
    </div>
  );
}
