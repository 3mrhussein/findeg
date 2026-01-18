'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart, useTranslation } from '@/presentation/hooks';
import { Container } from '@/presentation/components/layout/Container';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';

export const CheckoutContent: React.FC = () => {
    const { t } = useTranslation();
    const { cartItems, cartTotal } = useCart();
    const router = useRouter();

    if (cartItems.length === 0) {
        return (
            <Container className="py-20 text-center">
                <h1 className="text-2xl font-bold">{t('cart_empty')}</h1>
                <Button onClick={() => router.push('/shop')} className="mt-4">{t('hero_button_shop')}</Button>
            </Container>
        );
    }

    return (
        <div className="bg-muted">
            <Container className="py-12 lg:py-16">
                <h1 className="text-3xl font-bold text-center mb-10">{t('checkout_title')}</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{t('checkout_shipping_info')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input type="text" placeholder="First Name" />
                                <Input type="text" placeholder="Last Name" />
                                <Input type="email" placeholder="Email Address" className="sm:col-span-2" />
                                <Input type="text" placeholder="Address" className="sm:col-span-2" />
                                <Input type="text" placeholder="City" />
                                <Input type="text" placeholder="Postal Code" />
                                <div className="sm:col-span-2">
                                    <Button size="lg" className="w-full">{t('checkout_continue_payment')}</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{item.name} x {item.quantity}</span>
                                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t my-6"></div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <Button size="lg" className="w-full mt-6">{t('checkout_place_order')}</Button>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </div>
    );
};
