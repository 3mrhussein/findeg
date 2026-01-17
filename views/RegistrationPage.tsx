'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { useTranslation, useUser } from '@/hooks';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/atoms/Icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const RegistrationPage: React.FC = () => {
    const { t } = useTranslation();
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
                            {isLoginView ? t('reg_title_login') : t('reg_title')}
                        </CardTitle>
                        <CardDescription>
                            {isLoginView ? t('reg_no_account') : t('reg_have_account')}{' '}
                            <button onClick={() => setIsLoginView(!isLoginView)} className="text-primary hover:underline font-medium">
                               {isLoginView ? t('reg_signup_link') : t('reg_signin_link')}
                            </button>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {!isLoginView && (
                                <div>
                                    <Label htmlFor="name">{t('reg_name')}</Label>
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
                                <Label htmlFor="email">{t('reg_email')}</Label>
                                <Input 
                                    type="email" 
                                    id="email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                             <div>
                                <Label htmlFor="password">{t('reg_password')}</Label>
                                <Input 
                                    type="password" 
                                    id="password" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <Button size="lg" className="w-full" type="submit">
                                {isLoginView ? t('reg_button_login') : t('reg_button')}
                            </Button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-card px-2 text-muted-foreground">
                                    {isLoginView ? t('reg_social_prompt_login') : t('reg_social_prompt')}
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

export default RegistrationPage;