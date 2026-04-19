"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui";
import { ProductReviews } from "./ProductReviews";

interface ProductTabsProps {
  product: any;
  reviews: any[];
}

/**
 *
 */
export function ProductTabs({ product, reviews }: ProductTabsProps) {
  return (
    <Tabs
      defaultValue="description"
      className="w-full mt-16 pt-8 border-t border-slate-100 dark:border-slate-800"
    >
      <div className="flex justify-center mb-8">
        <TabsList className="inline-flex max-w-fit items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 p-1">
          <TabsTrigger
            value="description"
            className="rounded-full px-8 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-surface-dark data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="rounded-full px-8 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-surface-dark data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Specifications
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="rounded-full px-8 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-surface-dark data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="mx-auto max-w-4xl">
        <TabsContent
          value="description"
          className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
        >
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
            <p className="leading-relaxed text-lg">
              {product.longDescription || product.description}
            </p>
          </div>
        </TabsContent>

        <TabsContent
          value="specs"
          className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
        >
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
              <div className="p-6">
                <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
                  SKU
                </div>
                <div className="text-lg font-medium text-slate-900 dark:text-white">
                  {product.sku}
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Category
                </div>
                <div className="text-lg font-medium text-slate-900 dark:text-white">
                  {product.categoryName}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="reviews"
          className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
        >
          <ProductReviews reviews={reviews} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
