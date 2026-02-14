"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart, DollarSign, ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Order } from "@/domain/entities/Order";
import { DashboardStats } from "@/domain/types/admin";
import { useTranslations } from "next-intl";

/**
 *
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("Pages.Dashboard");

  useEffect(() => {
    /**
     *
     */
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResponse, ordersResponse] = await Promise.all([
          fetch("/api/v1/admin/dashboard/stats"),
          fetch("/api/v1/admin/orders?limit=5"),
        ]);

        if (!statsResponse.ok || !ordersResponse.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const statsData = await statsResponse.json();
        const ordersData = await ordersResponse.json();

        setStats(statsData.data);
        setRecentOrders(ordersData.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 pt-6 space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 h-96 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="col-span-3 h-96 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 pt-6 flex items-center justify-center text-red-500">{error}</div>
    );
  }

  const statCards = [
    {
      title: t("TotalRevenue"),
      value: `${stats?.currency || "EGP"} ${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      description: "+20.1% from last month",
    },
    {
      title: t("TotalOrders"),
      value: stats?.totalOrders?.toLocaleString() || 0,
      icon: ShoppingCart,
      description: "+180.1% from last month",
    },
    {
      title: t("TotalProducts"),
      value: stats?.totalProducts?.toLocaleString() || 0,
      icon: Package,
      description: "+19% from last month",
    },
    {
      title: t("Stats.TotalCategories"),
      value: stats?.totalCategories?.toLocaleString() || 0,
      icon: Users,
      description: "+201 since last hour",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("Title")}</h2>
        <div className="flex items-center space-x-2">
          <Button>Download Reports</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders Overview */}
        <Card className="col-span-4 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>{t("RecentOrders")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Table.OrderId")}</TableHead>
                  <TableHead>{t("Table.Status")}</TableHead>
                  <TableHead className="text-right">{t("Table.Total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "default"
                            : order.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {order.currency} {order.totalAmount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions / Recent Sales (Placeholder) */}
        <Card className="col-span-3 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>{t("QuickActions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/products/new">
                  <Package className="mr-2 h-4 w-4" />
                  {t("AddProduct")}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/categories/new">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  {t("AddCategory")}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/admin/brands">
                  <Package className="mr-2 h-4 w-4" />
                  {t("ManageBrands")}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/admin/inventory">
                  <Package className="mr-2 h-4 w-4" />
                  {t("Sidebar.Inventory")}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/admin/orders">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t("Sidebar.Orders")}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/admin/audit-log">
                  <Users className="mr-2 h-4 w-4" />
                  {t("Sidebar.AuditLog")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
