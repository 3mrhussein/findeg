import { getTranslations } from 'next-intl/server';
import type { Locale } from '@findeg/domain';
import { Link } from '@i18n/navigation';
import { CurrentYear } from './CurrentYear';

interface FooterProps {
  locale: Locale;
}

/**
 * Site-wide footer.
 */
export async function Footer({ locale }: FooterProps) {
  // ✅ locale + namespace together — next-intl skips headers() call
  const t = await getTranslations({ locale, namespace: 'Layout.Footer' });

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
                FindEg<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-relaxed">
              {t('Tagline') ||
                "Streamlining back-to-school shopping with guaranteed exact matches for your school's official supply lists."}
            </p>
            <div className="flex gap-4">
              <a
                href="mailto:support@findeg.com"
                className="flex size-10 items-center justify-center rounded-full bg-white/5 text-white hover:bg-primary hover:text-white transition-colors"
                aria-label="Email support"
              >
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">
              {t('ShopTitle')}
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/shop" className="hover:text-primary transition-colors">
                  {t('AllProducts')}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary transition-colors">
                  {t('Categories')}
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-primary transition-colors">
                  {t('Collections')}
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-primary transition-colors">
                  {t('Search')}
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-primary transition-colors">
                  {t('Cart')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">
              {t('SchoolsTitle')}
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/school-lists" className="hover:text-primary transition-colors">
                  {t('FindYourList')}
                </Link>
              </li>
              <li>
                <Link href="/schools" className="hover:text-primary transition-colors">
                  {t('Schools')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">
              {t('HelpTitle')}
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/order-lookup" className="hover:text-primary transition-colors">
                  {t('TrackOrder')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  {t('AboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  {t('ContactSupport')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  {t('ReturnPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  {t('TermsOfService')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row text-sm">
          <p>
            &copy; <CurrentYear /> FindEg. {t('Copyright')}
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-[24px]">payments</span>
            <span className="material-symbols-outlined text-[24px]">account_balance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
