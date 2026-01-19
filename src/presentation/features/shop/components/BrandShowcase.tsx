'use client';

import React from 'react';
import Image from 'next/image';
import { Container } from '@/presentation/shared/layout/Container';
import { brandLogos } from '@/lib/constants';
import { useTranslations } from 'next-intl';
import { T } from '@/i18n/content';

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
                            <Image
                                className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
                                src={brand.logoUrl}
                                alt={brand.name}
                                width={120}
                                height={48}
                            />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
};

export const BrandShowcase: React.FC = () => {
    const t = useTranslations();
    return <BrandShowcaseUI title={t(T.PAGES.ABOUT.BRAND_SHOWCASE_TITLE)} />;
};
