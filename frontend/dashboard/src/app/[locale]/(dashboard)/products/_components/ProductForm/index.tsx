'use client';

import type { Locale } from '@findeg/domain';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@i18n/navigation';
import { toast } from 'sonner';
import { Tabs, TabsContent } from '@findeg/ui';
import { Form } from '@findeg/ui';

import { ProductFormHeader } from './ProductFormHeader';
import { ProductFormTabs } from './ProductFormTabs';
import { ProductFormSidebar } from '../ProductFormSidebar';
import { InfoTab } from './tabs/InfoTab';
import { VariantsTab } from './tabs/VariantsTab';
import { MediaTab } from './tabs/MediaTab';
import { SeoTab } from './tabs/SeoTab';
import type { Brand, Tag } from '@findeg/catalog';
import { ProductFormSchema, ProductFormValues } from '@/interfaces';
import { createProduct, updateProduct } from '@data/products/actions';

interface ProductFormProps {
  initialData?: import('@findeg/catalog').Product;
  categories: import('@findeg/catalog').Category[];
  brands: Brand[];
  tags: Tag[];
  locale: string;
}

/**
 * Unified Product Create/Edit Form
 */
export function ProductForm({
  initialData,
  categories,
  brands,
  tags,
  locale: _locale,
}: ProductFormProps) {
  const t = useTranslations('Administration.Catalog.Products.Form');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('info');

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(
      ProductFormSchema,
    ) as import('react-hook-form').Resolver<ProductFormValues>,
    defaultValues: initialData
      ? {
          localizedName:
            initialData.localizedContent?.name ||
            ({ en: '', ar: '' } satisfies Record<Locale, string | undefined>),
          localizedDescription:
            initialData.localizedContent?.description ||
            ({ en: '', ar: '' } satisfies Record<Locale, string | undefined>),
          localizedLongDescription:
            initialData.localizedContent?.longDescription ||
            ({
              en: '',
              ar: '',
            } satisfies Record<Locale, string | undefined>),
          localizedSlug:
            (
              initialData.localizedContent as typeof initialData.localizedContent & {
                slug?: { en: string; ar?: string };
              }
            )?.slug || ({ en: '', ar: '' } satisfies Record<Locale, string | undefined>),
          categoryId: initialData.categoryId,
          brandId: initialData.brandId,
          tagIds: initialData.tags?.map((t) => t.id) || [],
          isActive: initialData.isActive,
          variants: (initialData.variants || []).map((v) => ({
            id: v.id,
            sku: v.sku,
            basePrice: Number(v.basePrice),
            strikePrice: v.strikePrice ? Number(v.strikePrice) : null,
            costPrice: v.costPrice ? Number(v.costPrice) : null,
            weightGrams: v.weightGrams,
            isActive: v.isActive,
            isDefault: v.isDefault,
            sortOrder: v.sortOrder,
            localizedLabel:
              v.localizedLabel || ({ en: '', ar: '' } satisfies Record<Locale, string | undefined>),
            images: (v.images || []).map((img) => ({
              url: img.url,
              alt: img.alt || '',
              displayOrder: img.displayOrder,
            })),
            attributes: (v.attributes || []).map((attr) => ({
              attributeKey: attr.key,
              value: attr.valueText || '',
            })),
          })),
        }
      : {
          isActive: true,
          localizedName: { en: '', ar: '' } satisfies Record<Locale, string | undefined>,
          localizedDescription: { en: '', ar: '' } satisfies Record<Locale, string | undefined>,
          localizedLongDescription: { en: '', ar: '' } satisfies Record<Locale, string | undefined>,
          localizedSlug: { en: '', ar: '' } satisfies Record<Locale, string | undefined>,
          variants: [
            {
              sku: '',
              localizedLabel: { en: 'Standard', ar: 'قياسي' } satisfies Record<
                Locale,
                string | undefined
              >,
              basePrice: 0,
              costPrice: 0,
              strikePrice: null,
              weightGrams: null,
              barcode: '',
              isActive: true,
              isDefault: true,
              sortOrder: 0,
              images: [],
              attributes: [],
            },
          ],
          tagIds: [],
        },
    mode: 'onChange',
  });

  const onSubmit = async (values: ProductFormValues) => {
    startTransition(async () => {
      const result = initialData
        ? await updateProduct(initialData.id, {
            ...values,
            pricingMode: 'per-variant',
            variants: values.variants.map((variant) => ({
              ...variant,
              localizedLabel: {
                en: variant.localizedLabel.en,
                ar: variant.localizedLabel.ar || '',
              } satisfies Record<Locale, string | undefined>,
            })),
          })
        : await createProduct({
            ...values,
            pricingMode: 'per-variant',
            variants: values.variants.map((variant) => ({
              ...variant,
              localizedLabel: {
                en: variant.localizedLabel.en,
                ar: variant.localizedLabel.ar || '',
              } satisfies Record<Locale, string | undefined>,
            })),
          });

      if (result.success) {
        toast.success(initialData ? t('updated') : t('created'));
        if (!initialData && result.data?.productId) {
          router.push(`/products/${result.data?.productId}/edit`);
        }
      } else {
        toast.error(result.error || 'Save failed');
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative flex flex-col h-screen max-h-screen bg-background"
      >
        {/* Sticky header — always visible */}
        <ProductFormHeader
          isEdit={!!initialData}
          isPending={isPending}
          onSaveDraft={() => form.handleSubmit(onSubmit)()}
          productName={initialData?.localizedContent?.name?.en || ''}
        />

        {/* Sticky tab bar — below header */}
        <ProductFormTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Scrollable content + sidebar */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto minimal-scrollbar bg-muted/10 p-8 pb-24">
            <div className="max-w-5xl mx-auto w-full">
              <Tabs value={activeTab} className="w-full">
                <TabsContent value="info" className="mt-0 focus-visible:outline-none">
                  <InfoTab />
                </TabsContent>
                <TabsContent value="variants" className="mt-0 focus-visible:outline-none">
                  <VariantsTab />
                </TabsContent>
                <TabsContent value="media" className="mt-0 focus-visible:outline-none">
                  <MediaTab />
                </TabsContent>
                <TabsContent value="seo" className="mt-0 focus-visible:outline-none">
                  <SeoTab />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <aside className="w-80 border-l bg-background overflow-y-auto minimal-scrollbar p-6 hidden xl:block">
            <ProductFormSidebar categories={categories} brands={brands} tags={tags} />
          </aside>
        </div>
      </form>
    </Form>
  );
}
