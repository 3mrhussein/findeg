'use client';

import { useState } from 'react';
import { Link } from '@i18n/navigation';
import { Search } from 'lucide-react';

/**
 * Placeholder SearchBar
 * To be replaced by the full SearchBar component prompt.
 */
export function SearchBar() {
  const [query, setQuery] = useState('');

  /**
   *
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full max-w-xl items-center">
      <input
        type="text"
        placeholder="Search for products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900"
      />
      <div className="absolute left-3 flex h-full items-center justify-center text-slate-400">
        <Search className="size-4" />
      </div>
    </form>
  );
}
