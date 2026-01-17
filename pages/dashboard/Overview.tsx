import React from 'react';
import { useTranslation } from '../../hooks';
import { StatCard } from '../../components/molecules/StatCard';
import { SalesChart } from '../../components/molecules/SalesChart';
import { UserActivityChart } from '../../components/molecules/UserActivityChart';
import { DeviceUsageChart } from '../../components/molecules/DeviceUsageChart';
import { Icon } from '../../components/atoms/Icon';
import { products, orders } from '../../constants';
import { OrderTable } from '../../components/organisms/OrderTable';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export const Overview: React.FC = () => {
    const { t } = useTranslation();

    const totalRevenue = orders.reduce((sum, order) => order.status !== 'Cancelled' ? sum + order.total : sum, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;

    const monthlySalesData = [
        { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
        { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
        { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
        { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
        { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
        { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
    ];
    
    const weeklyActivityData = [
        { day: 'Mon', users: Math.floor(Math.random() * 300) + 50 },
        { day: 'Tue', users: Math.floor(Math.random() * 300) + 50 },
        { day: 'Wed', users: Math.floor(Math.random() * 300) + 50 },
        { day: 'Thu', users: Math.floor(Math.random() * 300) + 50 },
        { day: 'Fri', users: Math.floor(Math.random() * 300) + 50 },
        { day: 'Sat', users: Math.floor(Math.random() * 300) + 50 },
        { day: 'Sun', users: Math.floor(Math.random() * 300) + 50 },
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