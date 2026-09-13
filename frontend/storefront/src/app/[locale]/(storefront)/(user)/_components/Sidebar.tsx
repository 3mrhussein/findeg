'use client';

import { Link, usePathname } from '@i18n/navigation';
import { cn } from '@lib/utils';
import { Button } from '@findeg/ui';
import { IconTooltip } from '@findeg/ui';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@findeg/ui';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Sidebar for the user dashboard (My Account).
 */
export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Pages.MyAccount');

  const routes = [
    {
      href: '/my-account',
      label: t('Profile'),
      icon: LayoutDashboard,
      active: pathname === '/my-account',
    },
    {
      href: '/my-account/orders',
      label: t('Orders'),
      icon: ShoppingCart,
      active: pathname.includes('/my-account/orders'),
    },
    {
      href: '/my-account/settings',
      label: t('Settings'),
      icon: Settings,
      active: pathname.includes('/my-account/settings'),
    },
  ];

  return (
    <>
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full flex-col gap-4">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-bold text-xl text-primary" href="/">
              <span className="text-2xl">FindEg.</span>Stationary
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
                    route.active ? 'bg-muted text-primary' : 'text-muted-foreground',
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <IconTooltip label="Toggle navigation menu" asChild>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden ms-4 mt-4"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
        </IconTooltip>
        <SheetContent side="left" className="flex flex-col p-0 w-72">
          <div className="flex h-full flex-col gap-4">
            <div className="flex h-[60px] items-center border-b px-6">
              <Link
                className="flex items-center gap-2 font-bold text-xl text-primary"
                href="/"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-2xl">FindEg.</span>Stationary
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-sm font-medium">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
                      route.active ? 'bg-muted text-primary' : 'text-muted-foreground',
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
