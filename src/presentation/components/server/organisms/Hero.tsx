/**
 * Hero Organism (Server Component)
 * 
 * This component handles data fetching for the Hero section.
 * It uses HeroUI (Client Component) for rendering if interactivity is needed,
 * or stays pure server-side if it's just links.
 */

import React from 'react';
import { HeroUI } from '@/presentation/components/client/organisms/HeroUI';
import { getStaticTranslation } from '@/infrastructure/translations/static';

interface HeroProps {
    imageUrl?: string;
    language?: string;
}

export const Hero = async ({ imageUrl, language = 'en' }: HeroProps) => {
    const t = await getStaticTranslation(language);

    return (
        <HeroUI
            imageUrl={imageUrl}
            titlePart1={t['hero_title_part1'] || 'Welcome to'}
            titleLearning={t['hero_title_learning'] || 'Learning'}
            titlePlay={t['hero_title_play'] || 'Play'}
            subtitle={t['hero_subtitle'] || 'Your one-stop shop for premium products.'}
            shopButtonText={t['hero_button_shop'] || 'Shop Now'}
            exploreButtonText={t['hero_button_explore'] || 'Explore'}
        />
    );
};