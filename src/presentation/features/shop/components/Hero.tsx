/**
 * Hero Organism (Server Component)
 * 
 * This component handles data fetching for the Hero section.
 * It uses HeroUI (Client Component) for rendering if interactivity is needed,
 * or stays pure server-side if it's just links.
 */

import React from 'react';
import { HeroUI } from '@/presentation/shared/layout/Hero';
import { getTranslations } from 'next-intl/server';

interface HeroProps {
    imageUrl?: string;
    language?: string;
}

export const Hero = async ({ imageUrl, language = 'en' }: HeroProps) => {
    const t = await getTranslations();

    return (
        <HeroUI
            imageUrl={imageUrl}
            titlePart1={t('Pages.Home.Hero.TitlePart1')}
            titleLearning={t('Pages.Home.Hero.TitleLearning') || 'Learning'}
            titlePlay={t('Pages.Home.Hero.TitlePlay') || 'Play'}
            subtitle={t('Pages.Home.Hero.Subtitle') || 'Your one-stop shop for premium products.'}
            shopButtonText={t('Pages.Home.Hero.ButtonShop') || 'Shop Now'}
            exploreButtonText={t('Pages.Home.Hero.ButtonExplore') || 'Explore'}
        />
    );
};