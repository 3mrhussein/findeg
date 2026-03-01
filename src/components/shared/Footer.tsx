import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { Link } from "@/i18n/routing";

const CURRENT_YEAR = new Date().getFullYear();

interface FooterProps {
  locale: Locale;
}

/**
 *
 */
export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale });

  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Listo<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-relaxed">
              {t("Layout.Footer.Tagline") ||
                "Streamlining back-to-school shopping with guaranteed exact matches for your school's official supply lists."}
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex size-10 items-center justify-center rounded-full bg-white/5 text-white hover:bg-primary hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
              </a>
              <a
                href="#"
                className="flex size-10 items-center justify-center rounded-full bg-white/5 text-white hover:bg-primary hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">Shop</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/shop" className="hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-primary transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-primary transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">Schools</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/school-lists" className="hover:text-primary transition-colors">
                  Find Your List
                </Link>
              </li>
              <li>
                <Link href="/school-lists" className="hover:text-primary transition-colors">
                  Partner Program
                </Link>
              </li>
              <li>
                <Link href="/school-lists" className="hover:text-primary transition-colors">
                  Fundraising
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">Help</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about#contact" className="hover:text-primary transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Return Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row text-sm">
          <p>&copy; {CURRENT_YEAR} FindEg.com (Listo). All rights reserved.</p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-[24px]">payments</span>
            <span className="material-symbols-outlined text-[24px]">credit_card</span>
            <span className="material-symbols-outlined text-[24px]">account_balance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
