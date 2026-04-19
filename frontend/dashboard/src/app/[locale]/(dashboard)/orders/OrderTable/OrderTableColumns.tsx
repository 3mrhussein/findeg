"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type Order } from "@backend/features/order";
import { Checkbox } from "@ui";
import { Button } from "@ui";
import { Badge } from "@ui";
import { MoreHorizontal, Phone, Eye, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui";
import { Link } from "@i18n/navigation";
import { formatDistanceToNow } from "date-fns";

/**
 * Helper to generate color variants for Payment Status
 */
function getPaymentStatusVariant(status?: string | null) {
  switch (status) {
    case "paid":
      return "default"; // green-ish in custom CSS ideally
    case "unpaid":
      return "secondary";
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
}

/**
 * Helper to generate color variants for Order Status
 */
function getOrderStatusVariant(status?: string | null) {
  switch (status) {
    case "delivered":
      return "default";
    case "cancelled":
    case "refunded":
      return "destructive";
    case "shipped":
    case "processing":
      return "secondary";
    case "confirmed":
      return "outline";
    case "pending":
    default:
      return "secondary"; // Maybe amber
  }
}

/**
 * Defines the columns for the Order Table.
 */
export function buildOrderColumns(): ColumnDef<Order>[] {
  return [
    {
      id: "select",
      /**
       *
       */
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      /**
       *
       */
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "Order #",
      /**
       *
       */
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <Link href={`/orders/${id}`} className="font-medium hover:underline text-primary">
            #FE-{String(id).padStart(5, "0")}
          </Link>
        );
      },
    },
    {
      id: "customer",
      header: "Customer",
      /**
       *
       */
      cell: ({ row }) => {
        const name = row.original.customerName || "Guest";
        // To do: if phone exists, link it. Since we don't have phone on Order easily, we might skip or fallback.
        // Assuming shippingAddressSnapshot might have phone.
        const phone = row.original.shippingAddressSnapshot?.phone;

        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{name}</span>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="text-muted-foreground hover:text-foreground"
                title={phone}
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      /**
       *
       */
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt!);
        const formatted = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const relative = formatDistanceToNow(date, { addSuffix: true });

        return (
          <div className="flex flex-col" title={relative}>
            <span>{formatted}</span>
            <span className="text-xs text-muted-foreground">{relative}</span>
          </div>
        );
      },
    },
    {
      id: "items",
      header: "Items",
      /**
       *
       */
      cell: ({ row }) => {
        const count = row.original.items?.length || 0;
        return (
          <span>
            {count} item{count !== 1 ? "s" : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      /**
       *
       */
      cell: ({ row }) => {
        const total = row.original.totalAmount;
        const currency = row.original.currency || "EGP";
        return (
          <span className="font-medium">
            {currency} {Number(total).toFixed(2)}
          </span>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      /**
       *
       */
      cell: ({ row }) => {
        const status = row.original.paymentStatus;
        return (
          <Badge variant={getPaymentStatusVariant(status)} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      /**
       *
       */
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={getOrderStatusVariant(status)} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      /**
       *
       */
      cell: ({ row }) => {
        const order = row.original;

        return (
          <div className="flex items-center justify-end gap-2">
            {order.status === "pending" && (
              <Button variant="outline" size="sm" className="hidden lg:flex" asChild>
                <Link href={`/orders/${order.id}?action=confirm`}>
                  <Check className="h-4 w-4 mr-1" /> Confirm
                </Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/orders/${order.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/orders/${order.id}?view=invoice`}>Printer Packing Slip</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
