import React from 'react';
import { Button } from '../ui/button';
import type { PageProps } from '../../types';
import { Container } from '../layout/Container';
import { useTranslation } from '../../hooks';

interface HeroUIProps extends PageProps {
    imageUrl?: string;
    titlePart1: string;
    titleLearning: string;
    titlePlay: string;
    subtitle: string;
    shopButtonText: string;
    exploreButtonText: string;
}

export const HeroUI: React.FC<HeroUIProps> = ({ 
    navigateTo, 
    imageUrl, 
    titlePart1, 
    titleLearning, 
    titlePlay,
    subtitle,
    shopButtonText,
    exploreButtonText
}) => {
  return (
    <section className="bg-muted dark:bg-card/50 overflow-hidden">
        <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
                <div className="text-center lg:text-left">
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                        {titlePart1} <span className="text-primary">{titleLearning}</span> & <span className="text-secondary">{titlePlay}</span>
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                        {subtitle}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                        <Button size="lg" onClick={() => navigateTo('shop')}>{shopButtonText}</Button>
                        <Button variant="outline" size="lg" onClick={() => document.querySelector('#categories')?.scrollIntoView({ behavior: 'smooth' })}>{exploreButtonText}</Button>
                    </div>
                </div>
                {imageUrl && (
                    <div className="hidden lg:flex justify-center">
                        <div className="relative w-[450px] h-[450px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-3xl opacity-30"></div>
                            <img 
                                src={imageUrl} 
                                alt="FindEg.com hero image" 
                                className="relative w-full h-full object-cover rounded-2xl shadow-xl transform rotate-3"
                            />
                        </div>
                    </div>
                )}
            </div>
        </Container>
    </section>
  );
};

// FIX: Add container component to handle logic and provide props to UI component.
interface HeroProps extends PageProps {
    imageUrl?: string;
}

export const Hero: React.FC<HeroProps> = ({ navigateTo, imageUrl }) => {
    const { t } = useTranslation();
    return (
        <HeroUI
            navigateTo={navigateTo}
            imageUrl={imageUrl}
            titlePart1={t('hero_title_part1')}
            titleLearning={t('hero_title_learning')}
            titlePlay={t('hero_title_play')}
            subtitle={t('hero_subtitle')}
            shopButtonText={t('hero_button_shop')}
            exploreButtonText={t('hero_button_explore')}
        />
    );
};