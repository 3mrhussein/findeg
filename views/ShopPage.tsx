'use client';

import React, { useState, useMemo } from 'react';
import { faqData, products as allProducts } from '@/constants';
import type { SortOption, ViewMode, Product } from '@/types';
import { Container } from '@/components/layout/Container';
import { Grid } from '@/components/layout/Grid';
import { ProductCard } from '@/components/molecules/ProductCard';
import { FilterSidebar } from '@/components/molecules/FilterSidebar';
import { useTranslation, useProducts, usePagination } from '@/hooks';
import { Button } from '@/components/ui/button';
import { ProductListItem } from '@/components/molecules/ProductListItem';
import { Pagination } from '@/components/molecules/Pagination';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/atoms/Icon';

const ShopPage: React.FC = () => {
  const { t } = useTranslation();
  const { sortedProducts, sortOption, setSortOption, setFilteredProducts } = useProducts(allProducts);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const {
    currentPage,
    totalPages,
    currentPageData: currentProducts,
    setCurrentPage,
  } = usePagination(sortedProducts, 8);


  const sortOptions = [
    { value: 'featured', label: t('shop_sort_featured') },
    { value: 'newest', label: t('shop_sort_newest') },
    { value: 'price-asc', label: t('shop_sort_price_asc') },
    { value: 'price-desc', label: t('shop_sort_price_desc') },
  ];

  const handleFilterChange = (newFilteredProducts: Product[]) => {
    setFilteredProducts(newFilteredProducts);
  };
  
  const faqItems = useMemo(() => {
    return faqData.map(item => ({
        id: item.questionKey,
        title: t(item.questionKey as any),
        content: t(item.answerKey as any)
    }));
  }, [t]);


  return (
    <>
      <div className="bg-muted">
        <Container className="py-12 lg:py-16">
          <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground">{t('shop_title')}</h1>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
            <div className="hidden lg:block lg:w-1/4 xl:w-1/5 lg:sticky lg:top-28 self-start">
              <FilterSidebar allProducts={allProducts} onFilterChange={handleFilterChange} />
            </div>

            <div className="w-full">
               <Dialog>
                 <DialogTrigger asChild>
                   <Button variant="outline" className="w-full lg:hidden mb-6">
                     {t('shop_filters_title')}
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>{t('shop_filters_title')}</DialogTitle>
                    </DialogHeader>
                    <div className="p-6">
                      <FilterSidebar allProducts={allProducts} onFilterChange={handleFilterChange} />
                    </div>
                 </DialogContent>
               </Dialog>

              {/* Sort and View Options */}
              <Card className="flex flex-wrap gap-4 justify-between items-center mb-6 p-4">
                <p className="text-muted-foreground text-sm">{t('shop_showing_results', {count: sortedProducts.length, total: allProducts.length})}</p>
                <div className='flex items-center gap-2'>
                    <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                        <SelectTrigger className="w-48" aria-label={t('shop_sort_by')}>
                            <SelectValue placeholder={t('shop_sort_by')} />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size='icon' onClick={() => setViewMode('grid')} aria-label="Grid view"><Icon name="grid" className='w-5 h-5'/></Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size='icon' onClick={() => setViewMode('list')} aria-label="List view"><Icon name="list" className='w-5 h-5'/></Button>
                </div>
              </Card>

              {/* Products */}
              {currentProducts.length > 0 ? (
                  viewMode === 'grid' ? (
                      <Grid>
                          {currentProducts.map(product => (
                              <ProductCard key={product.id} product={product} />
                          ))}
                      </Grid>
                  ) : (
                      <div className="space-y-4">
                          {currentProducts.map(product => (
                              <ProductListItem key={product.id} product={product} />
                          ))}
                      </div>
                  )
              ) : (
                  <Card className='text-center py-16'>
                      <p className='text-muted-foreground'>{t('shop_no_products')}</p>
                  </Card>
              )}
              
              {/* Pagination */}
              <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </Container>
      </div>
      
      <Container className="py-16 lg:py-24">
        <h2 className="text-3xl font-bold text-center text-foreground mb-2">{t('faq_title')}</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t('shop_by_category_subtitle')}
        </p>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map(item => (
                <AccordionItem value={item.id} key={item.id}>
                    <AccordionTrigger>{item.title}</AccordionTrigger>
                    <AccordionContent>{item.content}</AccordionContent>
                </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </>
  );
};

export default ShopPage;