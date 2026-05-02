import { getSchoolListPageData } from "@/data/school/queries";
import { SessionState } from "@findeg/backend";
import { createSchoolServices } from "@findeg/backend/features/school/application/services/factory";
import { getOptionalSession } from "@lib/auth-guard";
import { SchoolAuthWall } from "@app/[locale]/(storefront)/school/_components/SchoolAuthWall";
import { notFound } from "next/navigation";
import { redirect } from "@i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import { ListPageClient } from "./ListPageClient";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

/**
 * /lists/[slug]
 *
 * Direct List URL (Customized Parent Experience).
 */
export default function DirectListPage({ params, searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16 flex justify-center">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DirectListContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

/**
 *
 */
async function DirectListContent({ params, searchParams }: PageProps) {
  const { locale, slug } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale as Locale);
  const session = await getOptionalSession();

  if (!session) {
    return <SchoolAuthWall listTitle={slug.replace(/-/g, " ")} />;
  }

  const pageData = await getSchoolListPageData(slug, session?.userId || null);
  if (!pageData) return notFound();

  const { list, accessState, sessionState, fullList } = pageData;

  // 2. Token Check (if present) — This handles access granting (side-effect)
  if (token) {
    const { schoolAccess } = createSchoolServices();
    const tokenRecord = await schoolAccess.validateToken(token);
    if (tokenRecord && tokenRecord.listId === list.id) {
      await schoolAccess.grantAccessViaToken(list.id, session!.userId, tokenRecord.id);
      redirect({ href: `/lists/${slug}`, locale });
    }
  }

  // 3. Final Access Verification
  if (accessState !== "granted" && accessState !== "public") {
    const schoolSlug = list.schoolName.toLowerCase().replace(/\s+/g, "-");
    redirect({ href: `/schools/${schoolSlug}?restricted=${list.id}`, locale });
  }

  return (
    <ListPageClient
      list={fullList}
      initialSessionState={sessionState as SessionState}
      sessionUser={session}
    />
  );
}
