'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useTranslation } from '@/hooks';
import { Icon } from '../atoms/Icon';
import { Input } from '../ui/input';

interface ImageGeneratorUIProps {
    prompt: string;
    setPrompt: (value: string) => void;
    generatedImage: string | null;
    isLoading: boolean;
    error: string | null;
    onGenerate: () => void;
    title: string;
    subtitle: string;
    placeholder: string;
    generateButtonText: string;
    loadingButtonText: string;
    resultTitle: string;
    resultAlt: string;
}

export const ImageGeneratorUI: React.FC<ImageGeneratorUIProps> = ({
    prompt,
    setPrompt,
    generatedImage,
    isLoading,
    error,
    onGenerate,
    title,
    subtitle,
    placeholder,
    generateButtonText,
    loadingButtonText,
    resultTitle,
    resultAlt,
}) => {
  return (
    <section id="ai-generator" className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="bg-primary rounded-2xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
                <div className="inline-block bg-white/20 p-3 rounded-full mb-4">
                    <Icon name="magicWand" className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                    {subtitle}
                </p>
                
                <div className="max-w-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={placeholder}
                            className="h-12 text-base border-2 border-transparent focus-visible:ring-white bg-white/90 text-neutral-900 placeholder:text-neutral-800/60"
                            disabled={isLoading}
                        />
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={onGenerate}
                            disabled={isLoading}
                            className="shrink-0"
                        >
                            {isLoading ? loadingButtonText : generateButtonText}
                        </Button>
                    </div>
                    {error && <p className="mt-4 text-red-200">{error}</p>}
                </div>

                {isLoading && (
                    <div className="mt-12 flex justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
                    </div>
                )}

                {generatedImage && (
                    <div className="mt-12">
                        <h3 className="text-xl font-semibold text-white mb-4">{resultTitle}</h3>
                        <div className="bg-white p-2 rounded-lg shadow-xl inline-block">
                            <img
                                src={generatedImage}
                                alt={resultAlt}
                                className="max-w-full h-auto md:max-w-md rounded"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </section>
  );
};

// Mock image generator that uses placeholder images
const generateMockImage = async (prompt: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a placeholder image based on the prompt
    const seed = encodeURIComponent(prompt.slice(0, 20));
    return `https://picsum.photos/seed/${seed}/512/512`;
};

export const ImageGenerator: React.FC = () => {
    const { t } = useTranslation();
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError(t('generator_error_prompt'));
            return;
        }
        setError(null);
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            const imageUrl = await generateMockImage(prompt);
            setGeneratedImage(imageUrl);
        } catch (err) {
            setError(t('generator_error_failed'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <ImageGeneratorUI
            prompt={prompt}
            setPrompt={setPrompt}
            generatedImage={generatedImage}
            isLoading={isLoading}
            error={error}
            onGenerate={handleGenerate}
            title={t('generator_title')}
            subtitle={t('generator_subtitle')}
            placeholder={t('generator_placeholder')}
            generateButtonText={t('generator_button_generate')}
            loadingButtonText={t('generator_button_loading')}
            resultTitle={t('generator_result_title')}
            resultAlt={t('generator_result_alt')}
        />
    );
};