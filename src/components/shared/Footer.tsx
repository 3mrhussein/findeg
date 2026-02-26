import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";
import { Mail, Phone, Facebook, Instagram } from "lucide-react";
import { Link } from "@/i18n/routing";

const CURRENT_YEAR = new Date().getFullYear();

/**
 *
 */
interface FooterProps {
  locale: Locale;
}

/**
 *
 */
export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale });

  const shopLinks = [
    { label: t("Nav.Home"), href: "/" },
    { label: t("Nav.Categories"), href: "/categories" },
    { label: t("Nav.SchoolLists"), href: "/school-lists" },
    { label: t("Nav.Search"), href: "/search" },
    { label: t("Pages.Checkout.Title"), href: "/checkout" },
  ];

  const aboutLinks = [
    { label: t("Layout.Footer.AboutStory"), href: "/about" },
    { label: t("Layout.Footer.AboutCareers"), href: "/about#careers" },
    { label: t("Layout.Footer.AboutContact"), href: "/about#contact" },
  ];

  return (
    <footer className="border-t bg-muted/30">
      <Container className="py-10 md:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">{t("Layout.Footer.Tagline")}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              {t("Layout.Footer.ShopTitle")}
            </h2>
            <ul className="space-y-2 text-sm">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              {t("Layout.Footer.AboutTitle")}
            </h2>
            <ul className="space-y-2 text-sm">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              {t("Layout.Footer.FollowTitle")}
            </h2>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:support@findeg.com"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  support@findeg.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+201012345678"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Phone className="h-4 w-4" />
                  +20 10 1234 5678
                </a>
              </li>
              <li className="flex items-center gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="rounded-md border p-2 text-muted-foreground hover:text-foreground"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="rounded-md border p-2 text-muted-foreground hover:text-foreground"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-xs text-muted-foreground">
          <p>
            &copy; {CURRENT_YEAR} FindEg.com. {t("Layout.Footer.Copyright")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
