import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ImportWizard } from "./_components/ImportWizard";

/**
 *
 */
export default async function ProductImportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "en" | "ar" });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <Link href={`/${locale}/admin`}>Dashboard</Link>
            <span>/</span>
            <Link href={`/${locale}/admin/products`}>Products</Link>
            <span>/</span>
            <span className="font-medium text-foreground">Bulk Import</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mt-2">Bulk Import</h2>
          <p className="text-muted-foreground">
            Import products from a CSV file. Follow the steps below.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl py-6">
        <ImportWizard />
      </div>
    </div>
  );
}
