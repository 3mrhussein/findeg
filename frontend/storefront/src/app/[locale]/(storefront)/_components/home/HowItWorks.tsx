import { Card, CardContent } from "@ui";

/**
 *
 */
export function HowItWorks() {
  return (
    <section className="w-full bg-slate-50 dark:bg-slate-900/50 py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Get your year sorted in three simple steps. No more running between stores.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="group overflow-hidden rounded-2xl bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <CardContent className="flex flex-col items-center text-center p-6">
              <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[32px]">checklist</span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                Start Your List
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Select your school and grade to find your official supply list instantly.
              </p>
            </CardContent>
          </Card>
          <Card className="group overflow-hidden rounded-2xl bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <CardContent className="flex flex-col items-center text-center p-6">
              <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-accent/20 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[32px]">tune</span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                Adjust & Customize
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Already have a ruler? Remove it. Want the premium pencils? Swap them in.
              </p>
            </CardContent>
          </Card>
          <Card className="group overflow-hidden rounded-2xl bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <CardContent className="flex flex-col items-center text-center p-6">
              <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-mint/20 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[32px]">local_shipping</span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                Fast Checkout
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                One-click purchase with everything boxed and delivered to your doorstep.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
