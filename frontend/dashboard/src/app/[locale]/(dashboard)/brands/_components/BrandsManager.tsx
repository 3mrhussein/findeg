'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Plus, Filter, LayoutGrid, List } from 'lucide-react';
import { Input } from '@findeg/ui';
import { Button } from '@findeg/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@findeg/ui';
import { Badge } from '@findeg/ui';
import { cn } from '@lib/utils';
import { Brand } from '@findeg/backend/features/catalog';
import { BrandCard } from './BrandCard';
import { BrandFormPanel } from './BrandFormPanel';
import { BrandDrawer } from './BrandDrawer';
import { EmptyState } from '@findeg/ui';

interface BrandsManagerProps {
  initialBrands: Brand[];
  onSave: (data: any, id?: number) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
  onToggleStatus: (id: number) => Promise<any>;
}

export function BrandsManager({
  initialBrands,
  onSave,
  onDelete,
  onToggleStatus,
}: BrandsManagerProps) {
  const t = (useTranslations as any)('Administration.Catalog.Brands');
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [prevInitialBrands, setPrevInitialBrands] = useState<Brand[]>(initialBrands);

  // Sync with initialBrands when they change (e.g. after server action revalidation)
  if (initialBrands !== prevInitialBrands) {
    setBrands(initialBrands);
    setPrevInitialBrands(initialBrands);
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Screen size detection for panel vs drawer
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const filteredBrands = useMemo(() => {
    return brands
      .filter((brand) => {
        const matchesSearch =
          (brand.localizedName?.en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (brand.localizedName?.ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          brand.slug.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && brand.isActive) ||
          (statusFilter === 'inactive' && !brand.isActive);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.id as number) - (b.id as number));
  }, [brands, searchQuery, statusFilter]);

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsPanelOpen(true);
  };

  const handleCreate = () => {
    setSelectedBrand(null);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedBrand(null);
  };

  const handleFormSubmit = async (data: any) => {
    const result = await onSave(data, selectedBrand?.id);
    if (result.success) {
      handleClosePanel();
    }
    return result;
  };

  return (
    <div className="relative flex gap-0 transition-all duration-300">
      {/* List Column */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('SearchPlaceholder')}
                className="pl-9 h-10 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Segmented Status Filter */}
            <div className="flex items-center p-1 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800/50">
              <button
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-lg transition-all',
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                )}
              >
                {t('FilterAll')}
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-lg transition-all',
                  statusFilter === 'active'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                )}
              >
                {t('FilterActive')}
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-lg transition-all',
                  statusFilter === 'inactive'
                    ? 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                )}
              >
                {t('FilterInactive')}
              </button>
            </div>
          </div>

          <Button
            onClick={handleCreate}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 me-2" />
            {t('AddBrand')}
          </Button>
        </div>

        {/* Brands List */}
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredBrands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                isSelected={selectedBrand?.id === brand.id}
                onEdit={() => handleEdit(brand)}
                onDelete={() => onDelete(brand.id)}
                onToggleStatus={() => onToggleStatus(brand.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t('NoResults')}
            description={t('Subtitle')}
            action={{ label: t('AddBrand'), onClick: handleCreate }}
          />
        )}
      </div>

      {/* Inline Form Panel (lg+) */}
      <div
        className={cn(
          'hidden lg:flex flex-col',
          'w-[440px] shrink-0 ms-6',
          'border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden',
          'bg-white dark:bg-slate-900 shadow-sm',
          'sticky top-24 self-start',
          'transition-all duration-400 ease-in-out',
          isPanelOpen
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 pointer-events-none translate-x-8 w-0 ms-0',
          'h-[calc(100vh-140px)]',
        )}
      >
        {isPanelOpen && (
          <BrandFormPanel
            brand={selectedBrand}
            productCount={selectedBrand ? (selectedBrand as any)._count?.products || 0 : 0}
            onSubmit={handleFormSubmit}
            onClose={handleClosePanel}
          />
        )}
      </div>

      {/* Mobile Drawer (< lg) */}
      <BrandDrawer
        open={isPanelOpen && !isLargeScreen}
        onClose={handleClosePanel}
        brand={selectedBrand}
        productCount={selectedBrand ? (selectedBrand as any)._count?.products || 0 : 0}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
