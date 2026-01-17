'use client';

import React from 'react';
import { Container } from '../layout/Container';
import { brandLogos } from '@/constants';
import { useTranslation } from '@/hooks';

interface BrandShowcaseUIProps {
    title: string;
}

export const BrandShowcaseUI: React.FC<BrandShowcaseUIProps> = ({ title }) => {
    return (
        <div className="bg-background">
            <Container className="py-16 lg:py-24">
                <h2 className="text-center text-lg font-semibold text-muted-foreground">
                    {title}
                </h2>
                <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
                    {brandLogos.map((brand) => (
                        <div key={brand.name} className="flex justify-center">
                            <img
                                className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
                                src={brand.logoUrl}
                                alt={brand.name}
                            />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
};

export const BrandShowcase: React.FC = () => {
    const { t } = useTranslation();
    return <BrandShowcaseUI title={t('brand_showcase_title')} />;
};
