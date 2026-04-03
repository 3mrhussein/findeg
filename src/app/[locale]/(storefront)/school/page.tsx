import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/providers/animation-provider";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { SchoolListLookupForm } from "./_components/SchoolListLookupForm";
import { getSchoolListViewModel } from "@/features/school/application/queries/school-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SchoolListResults } from "./_components/SchoolListResults";
import { SectionStateEmpty } from "@/components/shared/state/SectionStateEmpty";

interface SchoolPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string }>;
}

/**
 *
 */
export default async function SchoolPage({ params, searchParams }: SchoolPageProps) {
  const { locale } = await params;
  const { code = "" } = await searchParams;
  const t = await getTranslations({ locale: locale as Locale });
  const viewModel = await getSchoolListViewModel(locale, code);

  return (
    <div className="bg-background py-12 md:py-20">
      <Container>
        <FadeIn className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{t("Pages.SchoolLists.Title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("Pages.SchoolLists.Subtitle")}
          </p>
        </FadeIn>

        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("Pages.SchoolLists.FormTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <SchoolListLookupForm initialCode={code} />
            </CardContent>
          </Card>

          {code && viewModel.productIds.length === 0 ? (
            <SectionStateEmpty
              title={t("Pages.SchoolLists.InvalidCodeTitle")}
              description={t("Pages.SchoolLists.InvalidCodeDescription")}
            />
          ) : null}

          {code && viewModel.productIds.length > 0 && viewModel.products.length === 0 ? (
            <SectionStateEmpty
              title={t("Pages.SchoolLists.NoResultsTitle")}
              description={t("Pages.SchoolLists.NoResultsDescription")}
            />
          ) : null}

          {viewModel.products.length > 0 ? (
            <SchoolListResults
              products={viewModel.products}
              totalEstimatedCost={viewModel.totalEstimatedCost}
            />
          ) : null}
        </div>
      </Container>
    </div>
  );
}
