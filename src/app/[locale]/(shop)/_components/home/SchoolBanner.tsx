import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { Link } from "@/i18n/routing";

/**
 *
 */
export async function SchoolBanner({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: locale as Locale });

  return (
    <section className="w-full py-16 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-secondary dark:bg-slate-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 size-80 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-16 relative z-10">
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("Pages.SchoolLists.SecondaryCtaTitle")}
              </h2>
              <p className="text-indigo-100 dark:text-slate-300 text-lg">
                {t("Pages.SchoolLists.SecondaryCtaDescription")}
              </p>
              <div className="pt-4">
                <Link
                  href="/school-lists"
                  className="inline-flex bg-white text-secondary font-bold py-3 px-6 rounded-full hover:bg-indigo-50 transition-colors"
                >
                  Register your school
                </Link>
              </div>
            </div>
            <div className="relative lg:h-[400px] w-full flex items-center justify-center">
              <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-xl shadow-2xl p-6 border border-white/10 dark:border-slate-700 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-indigo-100 dark:bg-slate-700"></div>
                    <div>
                      <div className="h-2.5 w-24 bg-slate-200 dark:bg-slate-600 rounded mb-1.5"></div>
                      <div className="h-2 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="h-2.5 w-32 bg-slate-200 dark:bg-slate-600 rounded"></div>
                    <div className="h-6 w-16 bg-green-100 text-green-700 text-xs font-bold rounded flex items-center justify-center">
                      Active
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="h-2.5 w-28 bg-slate-200 dark:bg-slate-600 rounded"></div>
                    <div className="h-6 w-16 bg-green-100 text-green-700 text-xs font-bold rounded flex items-center justify-center">
                      Active
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex gap-4">
                    <div className="h-20 flex-1 bg-primary/10 rounded-lg flex flex-col justify-center items-center">
                      <span className="text-2xl font-bold text-primary">84%</span>
                      <span className="text-xs text-primary/70">Participation</span>
                    </div>
                    <div className="h-20 flex-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex flex-col justify-center items-center">
                      <span className="text-2xl font-bold text-secondary dark:text-indigo-400">
                        $1.2k
                      </span>
                      <span className="text-xs text-secondary/70 dark:text-indigo-400/70">
                        Raised
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
