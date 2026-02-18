"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart,
  Settings,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 *
 */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/products",
      label: "Products",
      icon: Package,
      active: pathname.includes("/dashboard/products") || pathname === "/dashboard/Products", // Handle both cases
    },
    {
      href: "/dashboard/orders",
      label: "Orders",
      icon: ShoppingCart,
      active: pathname.includes("/dashboard/orders"),
    },
    {
      href: "/dashboard/customers",
      label: "Customers",
      icon: Users,
      active: pathname.includes("/dashboard/customers"),
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart,
      active: pathname.includes("/dashboard/analytics"),
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active: pathname.includes("/dashboard/settings"),
    },
  ];

  /**
   *
   */
  return (
    <>
      <div className={cn("hidden border-r bg-muted/40 md:block", className)}>
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    route.active ? "bg-muted text-primary" : "text-muted-foreground",
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
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden ml-4 mt-4">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
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
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                      route.active ? "bg-muted text-primary" : "text-muted-foreground",
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
