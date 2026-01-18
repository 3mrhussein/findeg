import React from 'react';
import { categories } from '@/constants';
import { getTranslation } from '@/lib/i18n-server';
import { Container } from '@/components/layout/Container';
import { CategoryCard } from '@/components/molecules/CategoryCard';

interface CategoriesTemplateProps {
  language?: 'en' | 'ar';
}

const CategoriesTemplate: React.FC<CategoriesTemplateProps> = ({ language = 'en' }) => {
    const { t } = getTranslation(language);

    return (
        <div className="bg-muted">
            <Container className="py-12 lg:py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground">{t('categories_page_title')}</h1>
                    <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">
                        {t('shop_by_category_subtitle')}
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category) => (
                        <CategoryCard key={category.name} category={category} />
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default CategoriesTemplate;