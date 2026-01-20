'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCart } from '@/presentation/features/cart/hooks/useCart';
import { Container } from '@/presentation/shared/layout/Container';
import { Button } from '@/presentation/shared/ui/button';
import { Input } from '@/presentation/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/shared/ui/card';

export const CheckoutContent: React.FC = () => {
    const t = useTranslations();
    const { cartItems, cartTotal } = useCart();
    const router = useRouter();

    if (cartItems.length === 0) {
        return (
            <Container className="py-20 text-center">
                <h1 className="text-2xl font-bold">{t('Pages.Cart.Empty')}</h1>
                <Button onClick={() => router.push('/shop')} className="mt-4">{t('Pages.Home.Hero.ButtonShop')}</Button>
            </Container>
        );
    }

    return (
        <div className="bg-muted">
            <Container className="py-12 lg:py-16">
                <h1 className="text-3xl font-bold text-center mb-10">{t('Pages.Checkout.Title')}</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{t('Pages.Checkout.ShippingInfo')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input type="text" placeholder={t('Pages.Checkout.FirstName')} />
                                <Input type="text" placeholder={t('Pages.Checkout.LastName')} />
                                <Input type="email" placeholder={t('Pages.Checkout.Email')} className="sm:col-span-2" />
                                <Input type="text" placeholder={t('Pages.Checkout.Address')} className="sm:col-span-2" />
                                <Input type="text" placeholder={t('Pages.Checkout.City')} />
                                <Input type="text" placeholder={t('Pages.Checkout.PostalCode')} />
                                <div className="sm:col-span-2">
                                    <Button size="lg" className="w-full">{t('Pages.Checkout.ContinuePayment')}</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>{t('Pages.Checkout.OrderSummary')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {cartItems.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{item.name} x {item.quantity}</span>
                                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t my-6"></div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>{t('Pages.Checkout.Total')}</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <Button size="lg" className="w-full mt-6">{t('Pages.Checkout.PlaceOrder')}</Button>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </div>
    );
};
