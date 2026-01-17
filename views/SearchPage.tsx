'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks';
import { Container } from '@/components/layout/Container';
import { Grid } from '@/components/layout/Grid';
import { ProductCard } from '@/components/molecules/ProductCard';
import { products } from '@/constants';

const SearchPage: React.FC = () => {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-background min-h-[60vh]">
            <Container className="py-12 lg:py-16">
                <div className="text-center mb-12">
                    {searchQuery ? (
                        <h1 className="text-3xl font-bold text-foreground">
                            {t('search_page_title', { query: `"${searchQuery}"` })}
                        </h1>
                    ) : (
                        <h1 className="text-3xl font-bold text-foreground">
                           Please enter a search term
                        </h1>
                    )}
                </div>
                {filteredProducts.length > 0 ? (
                    <Grid>
                        {filteredProducts.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                            />
                        ))}
                    </Grid>
                ) : (
                    <div className='text-center py-16 bg-muted rounded-lg'>
                        <p className='text-lg text-muted-foreground'>{t('search_no_results')}</p>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default SearchPage;