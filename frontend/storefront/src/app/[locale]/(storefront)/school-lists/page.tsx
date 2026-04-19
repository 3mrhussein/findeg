import { redirect } from "@i18n/navigation";

/**
 * /school-lists [Deprecated/Alias]
 *
 * Redirects to the newer /school location.
 */
export default async function SchoolListsAliasPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { locale } = await params;
  const { code } = await searchParams;

  if (code) {
    redirect({ href: `/school?code=${encodeURIComponent(code)}`, locale });
  }

  redirect({ href: "/school", locale });
}
