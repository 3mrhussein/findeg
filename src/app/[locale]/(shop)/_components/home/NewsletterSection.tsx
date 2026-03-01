/**
 *
 */
export function NewsletterSection() {
  return (
    <section className="w-full bg-white dark:bg-background-dark py-16 border-t border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="bg-slate-50 dark:bg-surface-dark p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="size-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Why Listo?</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              We verify every item against official school requirements so you never buy the wrong
              supplies again. Quality guaranteed.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-surface-dark p-8 rounded-2xl border border-slate-100 dark:border-slate-800 lg:col-span-2 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Join our newsletter
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Get checklist reminders and exclusive discounts on stationery.
            </p>
            <form className="flex gap-3 max-w-md">
              <input
                className="flex-1 rounded-full border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary"
                placeholder="Enter your email"
                type="email"
              />
              <button
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
                type="button"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
