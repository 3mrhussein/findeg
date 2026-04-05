import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@findeg/ui";
import { Badge } from "@findeg/ui";
import { BookOpen, GraduationCap } from "lucide-react";

/**
 * SchoolBanner — Homepage CTA section for school lists.
 * Uses a rich blue gradient that works in both light and dark mode.
 */
export async function SchoolBanner({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: locale as Locale });

  return (
    <section className="w-full py-16 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* The wrapper uses bg-primary as the base in both modes — a rich electric blue — this always gives white text sufficient contrast. */}
        <div className="rounded-3xl bg-primary overflow-hidden relative">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 -mt-24 -mr-24 size-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-24 -ml-24 size-96 rounded-full bg-black/10 blur-3xl pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-16 relative z-10">
            {/* ── Left: Copy ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6">
              {/* Badge pill */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/90">
                <GraduationCap className="size-3.5" />
                {t("Nav.School.SmartTool")}
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl leading-tight">
                {t("Pages.SchoolLists.SecondaryCtaTitle")}
              </h2>

              <p className="text-base lg:text-lg text-white/80 leading-relaxed max-w-lg">
                {t("Pages.SchoolLists.SecondaryCtaDescription")}
              </p>

              {/* Bullet trust points */}
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-white/60 shrink-0" />
                  Pre-fill your list in seconds
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-white/60 shrink-0" />
                  Works with printed & shared school codes
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-white/60 shrink-0" />
                  Add all items to cart with one tap
                </li>
              </ul>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  asChild
                  className="rounded-full px-7 font-bold bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10"
                >
                  <Link href="/school-lists">{t("Nav.School.CreateList")}</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-full px-7 font-bold text-white hover:bg-white/10 border border-white/20"
                >
                  <Link href="/school-lists">{t("Nav.School.LearnMore")}</Link>
                </Button>
              </div>
            </div>

            {/* ── Right: Decorative School List Card ──────────────────────── */}
            <div className="relative lg:h-[400px] w-full flex items-center justify-center">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-slate-700 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Card header */}
                <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <BookOpen className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Grade 5 — Science
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        12 required items
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 uppercase text-[10px] tracking-wide">
                    Active
                  </Badge>
                </div>

                {/* Line items */}
                <div className="space-y-2.5">
                  {[
                    { label: "Composition Notebook × 3", price: "EGP 45" },
                    { label: "Ballpoint Pens Set (12pc)", price: "EGP 30" },
                    { label: "Scientific Calculator", price: "EGP 180" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                    >
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {item.label}
                      </span>
                      <span className="text-xs font-bold text-primary shrink-0 ml-3">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer stats */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-3">
                    <div className="h-16 flex-1 bg-primary/10 dark:bg-primary/20 rounded-xl flex flex-col justify-center items-center">
                      <span className="text-xl font-black text-primary">84%</span>
                      <span className="text-[10px] text-primary/70 font-medium">Participation</span>
                    </div>
                    <div className="h-16 flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col justify-center items-center">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        EGP 255
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Estimated
                      </span>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full mt-4 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white"
                  >
                    <Link href="/school-lists">{t("Pages.SchoolLists.AddBundleToCart")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
