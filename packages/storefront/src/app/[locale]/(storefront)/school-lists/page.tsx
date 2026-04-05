import { redirect } from "next/navigation";

interface SchoolListsAliasPageProps {
  searchParams: Promise<{ code?: string }>;
}

/**
 *
 */
export default async function SchoolListsAliasPage({ searchParams }: SchoolListsAliasPageProps) {
  const { code } = await searchParams;
  if (code) {
    redirect(`/school?code=${encodeURIComponent(code)}`);
  }

  redirect("/school");
}
