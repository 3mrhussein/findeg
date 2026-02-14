import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServices } from "@/server/getServices";
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

/**
 *
 */
export default async function AdminDashboardPage() {
  const { adminDashboard } = getServices();
  const stats = await adminDashboard.getStats();
  const recentOrders = await adminDashboard.getRecentOrders();

  const statCards = [
    {
      title: "Total Revenue",
      value: `${stats.currency} ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "+20.1% from last month",
    },
    {
      title: "Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      description: "+180.1% from last month",
    },
    {
      title: "Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      description: "+19% from last month",
    },
    {
      title: "Total Categories",
      value: stats.totalCategories.toLocaleString(),
      icon: Users, // Using Users icon as placeholder for Categories if no better icon
      description: "+201 since last hour",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* Calendar DatePicker could go here */}
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
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
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
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/products/new">
                  <Package className="mr-2 h-4 w-4" />
                  Add New Product
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/categories/new">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Create Category
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
