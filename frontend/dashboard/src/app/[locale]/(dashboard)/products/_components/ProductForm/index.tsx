'use client';

import { useState, useTransition, useEffect } from 'react';
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
import type { Brand, Tag } from '@findeg/backend/features/catalog';
import { ProductFormSchema, ProductFormValues } from '@/interfaces';
import { createProduct, updateProduct } from '@data/products/actions';

interface ProductFormProps {
  initialData?: any; // TODO: Use ProductEditData type after repository-based refactoring
  categories: any[];
  brands: Brand[];
  tags: Tag[];
  locale: string;
}

/**
 * Unified Product Create/Edit Form
 */
export function ProductForm({ initialData, categories, brands, tags, locale }: ProductFormProps) {
  const t = useTranslations('Administration.Catalog.Products.Form');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('info');

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema) as any,
    defaultValues: (initialData
      ? {
          localizedName: initialData.localizedContent?.name || { en: '', ar: '' },
          localizedDescription: initialData.localizedContent?.description || { en: '', ar: '' },
          localizedLongDescription: initialData.localizedContent?.longDescription || {
            en: '',
            ar: '',
          },
          localizedSlug: initialData.localizedContent?.slug || { en: '', ar: '' },
          categoryId: initialData.categoryId,
          brandId: initialData.brandId,
          tagIds: initialData.tags?.map((t: any) => t.id) || [],
          isActive: initialData.isActive,
          variants: initialData.variants.map((v: any) => ({
            id: v.id,
            sku: v.sku,
            basePrice: Number(v.basePrice),
            isActive: v.isActive,
            displayOrder: v.displayOrder,
            localizedLabel: v.localizedLabel || { en: '', ar: '' },
            images: (v.images || []).map((img: any) => ({
              url: img.url,
              alt: img.alt || '',
              displayOrder: img.displayOrder,
            })),
            attributes: (v.attributes || []).map((attr: any) => ({
              attributeKey: attr.key,
              value: attr.valueText || '',
              isVariantDefining: true,
            })),
          })),
        }
      : {
          isActive: true,
          localizedName: { en: '', ar: '' },
          localizedDescription: { en: '', ar: '' },
          localizedLongDescription: { en: '', ar: '' },
          localizedSlug: { en: '', ar: '' },
          variants: [
            {
              sku: '',
              localizedLabel: { en: 'Standard', ar: 'قياسي' },
              basePrice: 0,
              costPrice: 0,
              strikePrice: null,
              weightGrams: null,
              barcode: '',
              lowStockThreshold: 10,
              isActive: true,
              displayOrder: 0,
              images: [],
              attributes: [],
            },
          ],
          tagIds: [],
        }) as any,
    mode: 'onChange',
  });

  const onSubmit = async (values: ProductFormValues) => {
    startTransition(async () => {
      const result = initialData
        ? await updateProduct(initialData.id, values as any)
        : await createProduct(values as any);

      if (result.success) {
        toast.success(initialData ? t('updated') : t('created'));
        if (!initialData && (result as any).productId) {
          router.push(`/products/${(result as any).productId}/edit`);
        }
      } else {
        toast.error(result.error || 'Save failed');
      }
    });
  };

  // Auto-save logic
  useEffect(() => {
    const timer = setInterval(() => {
      if (form.formState.isDirty) {
        // Implement auto-save to temporary storage or draft endpoint
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [form.formState.isDirty]);

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
