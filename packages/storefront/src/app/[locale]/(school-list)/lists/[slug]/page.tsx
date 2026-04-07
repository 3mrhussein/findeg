import { getServices } from "@server/getServices";
import { getOptionalSession } from "@lib/auth-guard";
import { SchoolAuthWall } from "@app/[locale]/(storefront)/school/_components/SchoolAuthWall";
import { notFound, redirect } from "next/navigation";
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

  const { schoolLists, schoolAccess, parentList } = getServices();

  // 1. Fetch the list
  const list = await schoolLists.getListBySlug(slug);
  if (!list) return notFound();

  // 2. Token Check (if present)
  if (token) {
    const tokenRecord = await schoolAccess.validateToken(token);
    if (tokenRecord && tokenRecord.listId === list.id) {
      await schoolAccess.grantAccessViaToken(list.id, session.userId, tokenRecord.id);
      redirect(`/lists/${slug}`);
    }
  }

  // 3. Final Access Verification
  const accessState = await schoolAccess.getAccessState(list.id, session.userId);
  if (accessState !== "granted" && accessState !== "public") {
    const schoolSlug = list.schoolName.toLowerCase().replace(/\s+/g, "-");
    redirect(`/schools/${schoolSlug}?restricted=${list.id}`);
  }

  // 4. Fetch Parent Session State
  const sessionState = await parentList.getSessionState(list.id, session.userId);

  // 5. Build full list data for client
  const fullList = await parentList.getListWithDetails(slug);

  return (
    <ListPageClient list={fullList} initialSessionState={sessionState} sessionUser={session} />
  );
}
