'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Check, Loader2, Globe, ImageIcon, AlertCircle, Box } from 'lucide-react';
import { Button } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Textarea } from '@findeg/ui';
import { Label } from '@findeg/ui';
import { RadioGroup, RadioGroupItem } from '@findeg/ui';
import { Badge } from '@findeg/ui';
import { slugify } from '@lib/slugify';
import { Brand } from '@findeg/backend/features/catalog';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { useDebounce } from '@hooks/use-debounce';
import { useToast } from '@hooks/use-toast';
import {
  BrandInputSchema,
  type BrandInput,
} from '@findeg/backend/features/catalog/application/dtos/BrandInput';

interface BrandFormPanelProps {
  brand: Brand | null;
  productCount?: number;
  onSubmit: (data: BrandInput) => Promise<any>;
  onClose: () => void;
}

export function BrandFormPanel({
  brand,
  productCount = 0,
  onSubmit,
  onClose,
}: BrandFormPanelProps) {
  const t = useTranslations('Administration.Catalog.Brands');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<BrandInput>({
    resolver: zodResolver(BrandInputSchema) as Resolver<BrandInput>,
    defaultValues: brand
      ? {
          slug: brand.slug,
          nameEn: brand.localizedName?.en || brand.name || '',
          nameAr: brand.localizedName?.ar || '',
          descriptionEn: brand.localizedDescription?.en || '',
          descriptionAr: brand.localizedDescription?.ar || '',
          logoUrl: brand.logoUrl || '',
          isActive: brand.isActive,
        }
      : {
          slug: '',
          nameEn: '',
          nameAr: '',
          descriptionEn: '',
          descriptionAr: '',
          logoUrl: '',
          isActive: true,
        },
  });

  // Reset form when brand increases or changes
  useEffect(() => {
    if (brand) {
      reset({
        slug: brand.slug,
        nameEn: brand.localizedName?.en || brand.name || '',
        nameAr: brand.localizedName?.ar || '',
        descriptionEn: brand.localizedDescription?.en || '',
        descriptionAr: brand.localizedDescription?.ar || '',
        logoUrl: brand.logoUrl || '',
        isActive: brand.isActive,
      });
    } else {
      reset({
        slug: '',
        nameEn: '',
        nameAr: '',
        descriptionEn: '',
        descriptionAr: '',
        logoUrl: '',
        isActive: true,
      });
    }
  }, [brand, reset]);

  const nameEn = watch('nameEn');
  const slug = watch('slug');
  const logoUrl = watch('logoUrl');
  const [debouncedSlug, setDebouncedSlug] = useState(slug);
  const debouncedValue = useDebounce(slug, 500);

  useEffect(() => {
    setDebouncedSlug(debouncedValue);
  }, [debouncedValue]);

  // Auto-generate slug from English name
  useEffect(() => {
    if (!brand && nameEn && !slug) {
      const generated = slugify(nameEn);
      setValue('slug', generated, { shouldValidate: true });
    }
  }, [nameEn, brand, setValue, slug]);

  // Check slug availability
  useEffect(() => {
    async function checkSlug() {
      if (!debouncedValue || debouncedValue.length < 2) {
        setIsSlugAvailable(null);
        return;
      }

      if (brand && debouncedValue === brand.slug) {
        setIsSlugAvailable(true);
        return;
      }

      setIsSlugChecking(true);
      try {
        const res = await fetch(
          `/api/v1/admin/brands/check-slug?slug=${debouncedValue}${brand ? `&excludeId=${brand.id}` : ''}`,
        );
        const data = await res.json();
        setIsSlugAvailable(data.available);
      } catch (error) {
        console.error('Slug check failed', error);
      } finally {
        setIsSlugChecking(false);
      }
    }
    checkSlug();
  }, [debouncedValue, brand]);

  const onFormSubmit = async (data: BrandInput) => {
    if (isSlugAvailable === false) {
      toast({
        title: t('SlugTaken'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(data);
      if (result.success) {
        toast({
          title: brand ? t('ToastUpdated') : t('ToastCreated'),
        });
      } else {
        toast({
          title: result.error || 'Error',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="flex flex-col h-full bg-white dark:bg-slate-900"
    >
      {/* Sticky Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {brand ? t('PanelEditTitle') : t('PanelCreateTitle')}
          </h2>
          {brand && (
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-[10px] bg-indigo-50 text-indigo-600 border-none dark:bg-indigo-500/10 dark:text-indigo-400"
              >
                <Box className="h-3 w-3 me-1" />
                {productCount}{' '}
                {t('ProductsCount', { count: productCount }).split(' ')[1] || 'Products'}
              </Badge>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin">
        {/* Logo Section */}
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {t('FieldLogoUrl')}
          </Label>
          <div className="flex gap-4">
            <div className="relative h-24 w-32 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden">
              {logoUrl ? (
                <div className="relative w-full h-full p-2">
                  <Image
                    src={logoUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                    sizes="128px"
                  />
                </div>
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 text-slate-300 mb-1" />
                  <span className="text-[10px] text-slate-400 font-medium">{t('NoPreview')}</span>
                </>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                {...register('logoUrl')}
                placeholder="https://..."
                className="rounded-xl border-gray-200 dark:border-slate-800 h-10"
              />
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                {t('FieldLogoHint')}
              </p>
              {errors.logoUrl && (
                <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.logoUrl.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Names (Localized) */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex justify-between">
              {t('FieldNameEn')}
              <span
                className={cn(
                  'text-[10px] font-normal',
                  (nameEn?.length || 0) > 50 ? 'text-amber-500' : 'text-slate-300',
                )}
              >
                {nameEn?.length || 0}/60
              </span>
            </Label>
            <Input
              {...register('nameEn')}
              placeholder="e.g. Faber-Castell"
              className="rounded-xl border-gray-200 dark:border-slate-800 h-11 focus:ring-indigo-500"
            />
            {errors.nameEn && (
              <p className="text-[10px] text-rose-500 font-medium">{errors.nameEn.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {t('FieldNameAr')}
            </Label>
            <Input
              {...register('nameAr')}
              placeholder="مثلاً: فابر كاستل"
              className="rounded-xl border-gray-200 dark:border-slate-800 text-right font-arabic dir-rtl h-11"
            />
            {errors.nameAr && (
              <p className="text-[10px] text-rose-500 font-medium">{errors.nameAr.message}</p>
            )}
          </div>
        </div>

        {/* Slug Section */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Globe className="h-3 w-3" />
            {t('FieldSlug')}
          </Label>
          <div className="relative">
            <Input
              {...register('slug')}
              placeholder="brand-slug"
              className="rounded-xl border-gray-200 dark:border-slate-800 h-10 pr-24 font-mono text-sm tracking-tight"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {isSlugChecking ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
              ) : isSlugAvailable === true ? (
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 font-normal px-1.5 h-5 text-[10px]">
                  {t('SlugAvailable')}
                </Badge>
              ) : isSlugAvailable === false ? (
                <Badge className="bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 font-normal px-1.5 h-5 text-[10px]">
                  {t('SlugTaken')}
                </Badge>
              ) : null}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic">findeg.com/brands/{slug || '...'}</p>
        </div>

        {/* Descriptions (Localized) */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {t('FieldDescriptionEn')}
            </Label>
            <Textarea
              {...register('descriptionEn')}
              rows={3}
              placeholder="Enter brand history or details..."
              className="rounded-xl border-gray-200 dark:border-slate-800 resize-none py-3"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {t('FieldDescriptionAr')}
            </Label>
            <Textarea
              {...register('descriptionAr')}
              rows={3}
              placeholder="أدخل تفاصيل الماركة باللغة العربية..."
              className="rounded-xl border-gray-200 dark:border-slate-800 resize-none py-3 text-right font-arabic dir-rtl"
            />
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {t('FieldStatus')}
          </Label>
          <RadioGroup
            defaultValue={brand?.isActive ? 'active' : 'inactive'}
            onValueChange={(val) => setValue('isActive', val === 'active', { shouldDirty: true })}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="status-active"
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer',
                watch('isActive')
                  ? 'bg-emerald-50/50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-white border-gray-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800',
              )}
            >
              <RadioGroupItem value="active" id="status-active" className="sr-only" />
              <Check
                className={cn('h-4 w-4 mb-2', watch('isActive') ? 'opacity-100' : 'opacity-0')}
              />
              <span className="text-sm font-semibold">{t('FilterActive')}</span>
            </Label>
            <Label
              htmlFor="status-inactive"
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer',
                !watch('isActive')
                  ? 'bg-slate-50 border-slate-400 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
                  : 'bg-white border-gray-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800',
              )}
            >
              <RadioGroupItem value="inactive" id="status-inactive" className="sr-only" />
              <X className={cn('h-4 w-4 mb-2', !watch('isActive') ? 'opacity-100' : 'opacity-0')} />
              <span className="text-sm font-semibold">{t('FilterInactive')}</span>
            </Label>
          </RadioGroup>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 sticky bottom-0 z-10">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 h-12 rounded-xl border-gray-200 dark:border-slate-800"
        >
          {t('Cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isSlugChecking || !isDirty}
          className="flex-2 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('Save')}
        </Button>
      </div>
    </form>
  );
}
