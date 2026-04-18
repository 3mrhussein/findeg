import { getSchoolListPageData } from "@/data/school/queries";
import { createSchoolServices } from "@backend/features/school/application/services/factory";
import { getOptionalSession } from "@lib/auth-guard";
import { SchoolAuthWall } from "@app/[locale]/(storefront)/school/_components/SchoolAuthWall";
import { notFound } from "next/navigation";
import { redirect } from "@i18n/navigation";
import { ListPageClient } from "./ListPageClient";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

/**
 * /lists/[slug]
 *
 * Direct List URL (Customized Parent Experience).
 */
export default async function DirectListPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params;
  const { token } = await searchParams;
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
    <ListPageClient list={fullList} initialSessionState={sessionState} sessionUser={session} />
  );
}
