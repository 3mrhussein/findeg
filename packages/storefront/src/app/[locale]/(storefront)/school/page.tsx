import { Container } from "@ui";
import { FadeIn } from "@providers/animation-provider";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import type { Locale } from "next-intl";
import { SchoolListLookupForm } from "./_components/SchoolListLookupForm";
import { getSchoolListData } from "@/data/school/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@ui";
import { SchoolListResults } from "./_components/SchoolListResults";
import { SectionStateEmpty } from "@components/shared/state/SectionStateEmpty";

interface SchoolPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string }>;
}

/** Wraps the async inner page in a Suspense boundary for PPR compliance. */
export default function SchoolPage(props: SchoolPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16 flex justify-center">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SchoolPageInner {...props} />
    </Suspense>
  );
}

/** Async inner page that reads params/searchParams. */
async function SchoolPageInner({ params, searchParams }: SchoolPageProps) {
  const { locale } = await params;
  const { code = "" } = await searchParams;
  const resLocale = locale as Locale;
  setRequestLocale(resLocale);
  const t = await getTranslations({ locale: resLocale });

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

          <SchoolListContent locale={locale} code={code} />
        </div>
      </Container>
    </div>
  );
}

/**
 * Data-fetching component that handles the cached data access.
 */
async function SchoolListContent({ locale, code }: { locale: string; code: string }) {
  const t = await getTranslations({ locale: locale as Locale });
  const viewModel = await getSchoolListData(locale, code);

  return (
    <>
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
    </>
  );
}
