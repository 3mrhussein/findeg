'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/presentation/hooks';
import { Container } from '@/presentation/components/layout/Container';
import { Button } from '@/presentation/components/ui/button';

const ErrorIllustration = () => (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary opacity-30 mb-6">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
        <path d="M13 17h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
    </svg>
);


const ErrorPage: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <Container className="flex items-center justify-center min-h-[calc(100vh-200px)] text-center">
            <div>
                <ErrorIllustration />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                    {t('error_page_title')}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                    {t('error_page_subtitle')}
                </p>
                <Button size="lg" onClick={() => router.push('/')} className="mt-8">
                    {t('error_page_button')}
                </Button>
            </div>
        </Container>
    );
};

export default ErrorPage;
