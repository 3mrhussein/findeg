import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

/**
 *
 */
export async function HeroSection() {
  return (
    <section className="w-full bg-slate-50 dark:bg-background py-12 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6 max-w-xl">
            <div className="inline-flex items-center gap-2 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-2 rounded-full bg-primary animate-pulse"></span>
              Back to School 2024
            </div>
            <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Smart lists. <br />
              <span className="text-primary">Beautiful stationery.</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              Manage school supply lists automatically and shop premium stationery curated for every
              grade level with ease.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                asChild
                className="rounded-full px-8 font-bold shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95 h-12"
              >
                <Link href="/shop">Shop stationery</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="rounded-full px-6 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 h-12"
              >
                <Link href="/school-lists" className="gap-2">
                  For schools
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative w-full lg:h-[500px] flex items-center justify-center">
            <div className="absolute top-10 right-10 size-32 rounded-full bg-accent/20 blur-3xl"></div>
            <div className="absolute bottom-10 left-10 size-24 rounded-full bg-mint/20 blur-2xl"></div>
            <div className="relative w-full aspect-4/3 lg:aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-2xl">
              <Image
                alt="Stationery"
                className="object-cover object-center transform hover:scale-105 transition-transform duration-700 bg-slate-200"
                src="https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?q=80&w=1200&auto=format&fit=crop"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -left-4 lg:bottom-12 lg:-left-12 z-10 w-64 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-xl border border-slate-100 dark:border-slate-700 animate-[bounce_3s_infinite]">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <span className="material-symbols-outlined text-yellow-600">backpack</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    School List
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Grade 3 Supply List
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full w-4/5 rounded-full bg-mint"></div>
                </div>
                <p className="text-xs font-medium text-mint">14 items ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
