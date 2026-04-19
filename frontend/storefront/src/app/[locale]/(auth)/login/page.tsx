import { Suspense } from "react";
import { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { LoginContent } from "./_components/LoginContent";

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 * Standalone Login Page
 */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
