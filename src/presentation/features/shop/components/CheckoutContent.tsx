'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { T } from '@/i18n/content';
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
                <h1 className="text-2xl font-bold">{t(T.PAGES.CART.EMPTY)}</h1>
                <Button onClick={() => router.push('/shop')} className="mt-4">{t(T.PAGES.HOME.HERO.BUTTON_SHOP)}</Button>
            </Container>
        );
    }

    return (
        <div className="bg-muted">
            <Container className="py-12 lg:py-16">
                <h1 className="text-3xl font-bold text-center mb-10">{t(T.PAGES.CHECKOUT.TITLE)}</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{t(T.PAGES.CHECKOUT.SHIPPING_INFO)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input type="text" placeholder={t(T.PAGES.CHECKOUT.FIRST_NAME)} />
                                <Input type="text" placeholder={t(T.PAGES.CHECKOUT.LAST_NAME)} />
                                <Input type="email" placeholder={t(T.PAGES.CHECKOUT.EMAIL)} className="sm:col-span-2" />
                                <Input type="text" placeholder={t(T.PAGES.CHECKOUT.ADDRESS)} className="sm:col-span-2" />
                                <Input type="text" placeholder={t(T.PAGES.CHECKOUT.CITY)} />
                                <Input type="text" placeholder={t(T.PAGES.CHECKOUT.POSTAL_CODE)} />
                                <div className="sm:col-span-2">
                                    <Button size="lg" className="w-full">{t(T.PAGES.CHECKOUT.CONTINUE_PAYMENT)}</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>{t(T.PAGES.CHECKOUT.ORDER_SUMMARY)}</CardTitle>
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
                                <span>{t(T.PAGES.CHECKOUT.TOTAL)}</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <Button size="lg" className="w-full mt-6">{t(T.PAGES.CHECKOUT.PLACE_ORDER)}</Button>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </div>
    );
};
