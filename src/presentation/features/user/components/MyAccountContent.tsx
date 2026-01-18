'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/presentation/shared/hooks';
import { useUser } from '@/presentation/features/user/hooks/useUser';
import { Container } from '@/presentation/shared/layout/Container';
import { Button } from '@/presentation/shared/ui/button';
import { products, orders } from '@/lib/constants';
import { ProductCard } from '@/presentation/features/shop/components/ProductCard';
import { Grid } from '@/presentation/shared/layout/Grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/shared/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/shared/ui/card';
import { Icon } from '@/presentation/shared/components/Icon';

const OrderStatusBadge: React.FC<{status: string}> = ({ status }) => {
    const statusClasses: { [key: string]: string } = {
        processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        delivered: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>{status}</span>
}

export const MyAccountContent: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser, isLoggedIn, logout } = useUser();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    }

    const userOrders = useMemo(() => {
        return orders.filter(order => order.customerName === currentUser?.name);
    }, [currentUser]);
    
    const userWishlist = useMemo(() => {
        if (!currentUser?.wishlist) return [];
        return products.filter(p => currentUser.wishlist.includes(p.id));
    }, [currentUser]);

    if (!isLoggedIn || !currentUser) {
        return (
            <Container className="py-20 text-center">
                <h1 className="text-2xl">Please log in to view your account.</h1>
                <Button onClick={() => router.push('/registration')} className="mt-4">Sign In</Button>
            </Container>
        );
    }
    
    return (
        <div className="bg-muted">
            <Container className="py-12 lg:py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground">{t('my_account_title')}</h1>
                    <p className="text-muted-foreground mt-2">{t('my_account_welcome', { name: currentUser.name })}</p>
                </div>
                
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8 max-w-lg mx-auto">
                        <TabsTrigger value="profile">{t('my_account_profile')}</TabsTrigger>
                        <TabsTrigger value="orders">{t('my_account_orders')}</TabsTrigger>
                        <TabsTrigger value="wishlist">{t('my_account_wishlist')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('my_account_profile')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div><strong className="font-semibold">Name:</strong> {currentUser.name}</div>
                                <div><strong className="font-semibold">Email:</strong> {currentUser.email}</div>
                                <div className="pt-6 mt-4 flex flex-col sm:flex-row gap-4 border-t">
                                    <Button onClick={() => router.push('/dashboard')}>
                                        <Icon name="dashboard" className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                                        {t('nav_dashboard')}
                                    </Button>
                                    <Button variant="destructive" onClick={handleLogout}>
                                        {t('my_account_logout')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('my_account_orders')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {userOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {userOrders.map(order => (
                                            <div key={order.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold">{t('order_id')}: {order.id}</div>
                                                        <div className="text-sm text-muted-foreground">{t('order_date')}: {order.date}</div>
                                                    </div>
                                                    <OrderStatusBadge status={order.status} />
                                                </div>
                                                <div className="border-t my-2"></div>
                                                <div className="text-sm text-muted-foreground">
                                                    {order.items.map(item => (
                                                        <div key={item.productId}>{item.productName} x {item.quantity}</div>
                                                    ))}
                                                </div>
                                                 <div className="text-right font-bold mt-2">{t('order_total')}: ${order.total.toFixed(2)}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">{t('my_account_no_orders')}</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="wishlist">
                         <Card>
                            <CardHeader>
                                <CardTitle>{t('my_account_wishlist')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 {userWishlist.length > 0 ? (
                                    <Grid>
                                        {userWishlist.map(product => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </Grid>
                                 ) : (
                                    <p className="text-muted-foreground">{t('my_account_no_wishlist')}</p>
                                 )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </Container>
        </div>
    );
};
