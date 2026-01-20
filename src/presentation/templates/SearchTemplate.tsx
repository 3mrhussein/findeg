import { useTranslations } from 'next-intl';
// ...removed import for T, use translation key directly
import { Container } from '@/presentation/shared/layout/Container';
import { Grid } from '@/presentation/shared/layout/Grid';
import { ProductCard } from '@/presentation/features/shop/components/ProductCard';
import { products } from '@/lib/constants'; 

interface SearchTemplateProps {
  language?: 'en' | 'ar';
  searchQuery?: string;
}

const SearchTemplate: React.FC<SearchTemplateProps> = ({ searchQuery = '' }) => {
    const t = useTranslations();

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
                            {t('Pages.Search.PageTitle', { query: `"${searchQuery}"` })}
                        </h1>
                    ) : (
                        <h1 className="text-3xl font-bold text-foreground">
                           {t('Pages.Search.EmptyPrompt')}
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
                        <p className='text-lg text-muted-foreground'>{t('Pages.Search.NoResults')}</p>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default SearchTemplate;