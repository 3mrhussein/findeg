'use client';

import React, { useState } from 'react';
import { ProductCard } from '@/components/molecules/ProductCard';
import { Grid } from '@/components/layout/Grid';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/atoms/Icon';
import { useTranslation } from '@/hooks';
import { Product } from '@/types';

interface ProductPaginationProps {
  products: Product[];
  productsPerPage?: number;
}

export const ProductPagination: React.FC<ProductPaginationProps> = ({ 
  products, 
  productsPerPage = 4 
}) => {
  const { t, language } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsAnimating(false);
    }, 300);
  };
  
  const currentProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <>
      <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <Grid>
          {currentProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
            />
          ))}
        </Grid>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-12 gap-4">
          <Button 
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1 || isAnimating}
            aria-label={t('pagination_previous')}
          >
            <Icon name="chevronRight" className={`w-5 h-5 ${language === 'en' ? 'rotate-180' : ''}`} />
          </Button>
          
          <p className="text-muted-foreground font-medium text-sm w-8 text-center">{currentPage} / {totalPages}</p>

          <Button 
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages || isAnimating}
            aria-label={t('pagination_next')}
          >
            <Icon name="chevronRight" className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      )}
    </>
  );
};
