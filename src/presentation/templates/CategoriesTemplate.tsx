import { useTranslations } from 'next-intl';
import { T } from '@/i18n/content';
import { categories } from '@/constants';
import { Container } from '@/presentation/shared/layout/Container';
import { CategoryCard } from '@/presentation/features/shop/components/CategoryCard';

interface CategoriesTemplateProps {
  language?: 'en' | 'ar';
}

const CategoriesTemplate: React.FC<CategoriesTemplateProps> = () => {
    const t = useTranslations();

    return (
        <div className="bg-muted">
            <Container className="py-12 lg:py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground">{t(T.LAYOUT.NAV.CATEGORIES)}</h1>
                    <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">
                        {t(T.PAGES.HOME.CATEGORIES.SUBTITLE)}
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category, index) => (
                        <CategoryCard 
                            key={category.name} 
                            category={{
                                id: index + 1,
                                slug: category.name.toLowerCase().replace(/ /g, '-'),
                                name: category.name,
                                description: category.description,
                                image: category.imageUrl
                            }} 
                        />
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default CategoriesTemplate;