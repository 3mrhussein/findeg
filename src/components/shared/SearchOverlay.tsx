"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useRouter } from "@/i18n/routing";

/**
 *
 */
export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Handle Cmd+K to open
  useEffect(() => {
    /**
     *
     */
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  /**
   *
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex size-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-[20px]">search</span>
          <span className="sr-only">Search</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-white/95 dark:bg-background/95 backdrop-blur-xl border-slate-200 dark:border-slate-800/50 shadow-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">Search Products</DialogTitle>
        <form
          onSubmit={handleSearch}
          className="relative flex items-center border-b border-slate-200 dark:border-slate-800 p-4"
        >
          <Search className="absolute left-6 w-6 h-6 text-slate-400" />
          <input
            type="text"
            placeholder="Search for stationery, backpacks, art supplies..."
            className="w-full bg-transparent pl-12 pr-12 text-xl sm:text-2xl font-semibold outline-none placeholder:text-slate-400 text-slate-900 dark:text-white h-14"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 dark:bg-transparent">
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Popular Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Backpacks", "Notebooks", "Pens & Pencils", "Art Supplies", "Calculators"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setQuery(cat);
                    }}
                    type="button"
                    className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium hover:border-primary hover:text-primary transition-colors text-slate-700 dark:text-slate-300"
                  >
                    {cat}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Recent Searches */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Searches
            </h3>
            <ul className="space-y-2">
              {["Staedtler Noris", "Faber-Castell Highlighters", "A4 Copy Paper"].map((search) => (
                <li key={search}>
                  <button
                    onClick={() => {
                      setQuery(search);
                    }}
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    {search}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Search for products, categories, or brands</span>
          <span className="hidden sm:inline-block">
            Press{" "}
            <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-xs">
              Esc
            </kbd>{" "}
            to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
