'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { useTranslations } from 'next-intl';
import { T } from '@/i18n/content';
import { useUser } from '@/presentation/features/user/hooks/useUser';
import { Container } from '@/presentation/shared/layout/Container';
import { Button } from '@/presentation/shared/ui/button';
import { Icon } from '@/presentation/shared/components/Icon';
import { Input } from '@/presentation/shared/ui/input';
import { Label } from '@/presentation/shared/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/presentation/shared/ui/card';

export const RegistrationContent: React.FC = () => {
    const t = useTranslations();
    const { login } = useUser();
    const router = useRouter();
    const [isLoginView, setIsLoginView] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Use form state to create user object, removing hardcoded values
        const userToLogin: User = {
            name: isLoginView ? (email.split('@')[0] || 'User') : name,
            email: email,
            wishlist: [], // Start with an empty wishlist for a new user
        };
        
        login(userToLogin);
        router.push('/');
    }

    return (
        <div className="bg-muted py-16 lg:py-24 w-full">
            <Container>
                <Card className="max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">
                            {isLoginView ? t(T.PAGES.AUTH.LOGIN_TITLE) : t(T.PAGES.AUTH.REGISTRATION_TITLE)}
                        </CardTitle>
                        <CardDescription>
                            {isLoginView ? t(T.PAGES.AUTH.NO_ACCOUNT) : t(T.PAGES.AUTH.HAVE_ACCOUNT)}{' '}
                            <button onClick={() => setIsLoginView(!isLoginView)} className="text-primary hover:underline font-medium">
                               {isLoginView ? t(T.PAGES.AUTH.SIGNUP_LINK) : t(T.PAGES.AUTH.SIGNIN_LINK)}
                            </button>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {!isLoginView && (
                                <div>
                                    <Label htmlFor="name">{t(T.PAGES.AUTH.NAME)}</Label>
                                    <Input 
                                        type="text" 
                                        id="name" 
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            )}
                            <div>
                                <Label htmlFor="email">{t(T.PAGES.AUTH.EMAIL)}</Label>
                                <Input 
                                    type="email" 
                                    id="email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                             <div>
                                <Label htmlFor="password">{t(T.PAGES.AUTH.PASSWORD)}</Label>
                                <Input 
                                    type="password" 
                                    id="password" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <Button size="lg" className="w-full" type="submit">
                                {isLoginView ? t(T.PAGES.AUTH.BUTTON_LOGIN) : t(T.PAGES.AUTH.BUTTON_REGISTER)}
                            </Button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-card px-2 text-muted-foreground">
                                    {isLoginView ? t(T.PAGES.AUTH.SOCIAL_PROMPT_LOGIN) : t(T.PAGES.AUTH.SOCIAL_PROMPT)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="grid grid-cols-3 gap-3 w-full">
                            <Button variant="outline" className="w-full"><Icon name="google" className="w-5 h-5" /></Button>
                            <Button variant="outline" className="w-full"><Icon name="facebook" className="w-5 h-5" /></Button>
                            <Button variant="outline" className="w-full"><Icon name="twitter" className="w-5 h-5" /></Button>
                        </div>
                    </CardFooter>
                </Card>
            </Container>
        </div>
    );
};
