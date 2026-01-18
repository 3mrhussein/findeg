import React from 'react';
import { useTranslation } from '@/presentation/hooks';
import { StatCard } from '@/presentation/components/features/dashboard/StatCard';
import { SalesChart } from '@/presentation/components/features/dashboard/SalesChart';
import { UserActivityChart } from '@/presentation/components/features/dashboard/UserActivityChart';
import { DeviceUsageChart } from '@/presentation/components/features/dashboard/DeviceUsageChart';
import { Icon } from '@/presentation/components/shared/Icon';
import { products, orders } from '@/lib/constants';
import { OrderTable } from '@/presentation/components/features/dashboard/OrderTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';

export const Overview: React.FC = () => {
    const { t } = useTranslation();

    const totalRevenue = orders.reduce((sum, order) => order.status !== 'cancelled' ? sum + order.total : sum, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;

    const monthlySalesData = [
        { name: 'Jan', total: 4000 },
        { name: 'Feb', total: 3000 },
        { name: 'Mar', total: 2000 },
        { name: 'Apr', total: 4500 },
        { name: 'May', total: 5900 },
        { name: 'Jun', total: 4800 },
    ];

    const weeklyActivityData = [
        { day: 'Mon', users: 120 },
        { day: 'Tue', users: 150 },
        { day: 'Wed', users: 200 },
        { day: 'Thu', users: 180 },
        { day: 'Fri', users: 250 },
        { day: 'Sat', users: 300 },
        { day: 'Sun', users: 280 },
    ];

    const deviceUsageData = [
        { name: 'Desktop', value: 65, color: 'hsl(174, 85%, 40%)' },
        { name: 'Mobile', value: 25, color: 'hsl(40, 95%, 50%)' },
        { name: 'Tablet', value: 10, color: 'hsl(210, 80%, 60%)' },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('dashboard_total_revenue')} value={totalRevenue} prefix="$" decimals={2} icon={<Icon name="dashboard" className="w-6 h-6"/>} />
                <StatCard title={t('dashboard_total_orders')} value={totalOrders} icon={<Icon name="shoppingCart" className="w-6 h-6"/>} />
                <StatCard title={t('dashboard_total_products')} value={totalProducts} icon={<Icon name="package" className="w-6 h-6"/>} />
                <StatCard title={t('dashboard_total_customers')} value={153} icon={<Icon name="users" className="w-6 h-6"/>} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SalesChart data={monthlySalesData} />
                </div>
                <DeviceUsageChart data={deviceUsageData} />
            </div>
            <div>
                <UserActivityChart data={weeklyActivityData} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard_recent_orders')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <OrderTable orders={orders.slice(0, 5)} />
                </CardContent>
            </Card>
        </div>
    );
};
