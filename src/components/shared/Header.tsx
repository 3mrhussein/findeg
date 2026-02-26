import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";
import { getHeaderCategoryTree } from "@/features/catalog/application/queries/header-nav";
import { HeaderNavClient } from "@/components/shared/HeaderNavClient";
import { getServices } from "@/server/getServices";
import type { Locale } from "next-intl";

interface HeaderProps {
  locale: Locale;
}

/**
 *
 */
export async function Header({ locale }: HeaderProps) {
  const { auth } = getServices();

  const [categories, session] = await Promise.all([
    getHeaderCategoryTree(locale),
    auth.getSession(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <HeaderNavClient categories={categories} isAuthenticated={Boolean(session?.userId)} />
      </Container>
    </header>
  );
}
