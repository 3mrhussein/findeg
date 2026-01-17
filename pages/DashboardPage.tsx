import React, { useState } from 'react';
import type { PageProps } from '../types';
import { useTranslation } from '../hooks';
import { Logo } from '../components/molecules/Logo';
import { Button } from '../components/ui/button';
import { Icon } from '../components/atoms/Icon';
import { Overview } from './dashboard/Overview';
import { Products } from './dashboard/Products';
import { Orders } from './dashboard/Orders';
import { Customers } from './dashboard/Customers';
import { Tooltip } from '../components/molecules/Tooltip';
import { cn } from '../lib/utils';


type DashboardView = 'overview' | 'products' | 'orders' | 'customers';

const LogoIcon = () => (
    <svg
        className="w-9 h-9"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19.8,2.8L21.2,4.2C21.6,4.6,21.6,5.2,21.2,5.6L16.6,10.2L13.8,7.4L18.4,2.8C18.8,2.4,19.4,2.4,19.8,2.8Z"
          className="text-secondary"
          fill="currentColor"
        />
        <path
          d="M13.8,7.4L16.6,10.2L6.4,20.4L2,22L3.6,17.6L13.8,7.4Z"
          className="text-primary"
          fill="currentColor"
        />
        <path
          d="M6.4,20.4L4.8,18.8L2,22L3.6,20.4L6.4,20.4Z"
          className="text-foreground"
          fill="currentColor"
        />
      </svg>
)

const DashboardPage: React.FC<PageProps> = ({ navigateTo }) => {
    const { t, language } = useTranslation();
    const [activeView, setActiveView] = useState<DashboardView>('overview');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const isRtl = language === 'ar';

    const navItems = [
        { id: 'overview', label: t('dashboard_overview'), icon: <Icon name="dashboard" className="w-5 h-5" /> },
        { id: 'products', label: t('dashboard_products'), icon: <Icon name="package" className="w-5 h-5" /> },
        { id: 'orders', label: t('dashboard_orders'), icon: <Icon name="shoppingCart" className="w-5 h-5" /> },
        { id: 'customers', label: t('dashboard_customers'), icon: <Icon name="users" className="w-5 h-5" /> },
    ];
    
    const activeNavItem = navItems.find(item => item.id === activeView);

    const renderContent = () => {
        switch (activeView) {
            case 'products':
                return <Products />;
            case 'orders':
                return <Orders />;
            case 'customers':
                return <Customers />;
            case 'overview':
            default:
                return <Overview />;
        }
    };
    
    return (
        <div className="flex min-h-screen bg-muted">
            {/* Sidebar */}
            <aside className={cn(
                "bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out fixed top-0 ltr:left-0 rtl:right-0 h-full z-10",
                isCollapsed ? "w-20" : "w-64"
            )}>
                 <div className="p-4 border-b border-border flex items-center justify-center h-[73px]">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('home') }}>
                       {isCollapsed ? <LogoIcon/> : <Logo navigateTo={navigateTo} />}
                    </a>
                </div>
                <nav className="p-2 flex-grow">
                    <ul className="space-y-1">
                        {navItems.map(item => (
                            <li key={item.id}>
                                {isCollapsed ? (
                                    <Tooltip tip={item.label} side={isRtl ? 'left' : 'right'}>
                                        <Button 
                                            variant={activeView === item.id ? 'secondary' : 'ghost'}
                                            onClick={() => setActiveView(item.id as DashboardView)}
                                            className="w-full justify-center"
                                            size="icon"
                                            aria-label={item.label}
                                        >
                                            {item.icon}
                                        </Button>
                                    </Tooltip>
                                ) : (
                                    <Button 
                                        variant={activeView === item.id ? 'secondary' : 'ghost'}
                                        onClick={() => setActiveView(item.id as DashboardView)}
                                        className="w-full justify-start gap-3"
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
                 <div className="p-2 border-t border-border">
                    <Tooltip tip={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} side={isRtl ? 'left' : 'right'}>
                         <Button
                            variant="ghost"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="w-full justify-center"
                            size="icon"
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <Icon name="chevronRight" className={cn('w-5 h-5 transition-transform duration-300', isCollapsed !== isRtl && 'rotate-180')} />
                        </Button>
                    </Tooltip>
                </div>
            </aside>
            {/* Main Content */}
            <div className={cn("flex flex-col flex-grow transition-all duration-300 ease-in-out", isCollapsed ? 'ltr:pl-20 rtl:pr-20' : 'ltr:pl-64 rtl:pr-64')}>
                <header className="flex items-center justify-between p-4 h-[73px] border-b bg-card sticky top-0 z-0">
                    <h1 className="text-xl font-bold">{activeNavItem?.label || ''}</h1>
                     <div>
                        {activeView === 'products' && (
                             <Button>
                                <Icon name="plus" className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                {t('dashboard_add_product')}
                            </Button>
                        )}
                     </div>
                </header>
                 <main className="flex-grow p-8 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;