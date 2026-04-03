import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderTableFiltersData } from "./OrderTable.interface";

interface OrderTableFiltersProps {
  filters: OrderTableFiltersData;
  onFilterChange: (key: keyof OrderTableFiltersData, value: any) => void;
  onClear: () => void;
  isPending: boolean;
  total: number;
}

/**
 *
 */
export function OrderTableFilters({
  filters,
  onFilterChange,
  onClear,
  isPending,
  total,
}: OrderTableFiltersProps) {
  const hasActiveFilters =
    Boolean(filters.search) || Boolean(filters.paymentStatus && filters.paymentStatus !== "all");
  // Add date checks here later if necessary

  return (
    <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2 flex-wrap">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search order #, customer name, email..."
            className="pl-8 bg-background"
            disabled={isPending}
            defaultValue={filters.search}
            data-testid="admin-orders-filter-search"
            onChange={(e) => {
              const val = e.target.value;
              const timeoutId = setTimeout(() => {
                onFilterChange("search", val);
              }, 400);
              return () => clearTimeout(timeoutId);
            }}
          />
        </div>

        <Select
          disabled={isPending}
          value={filters.paymentStatus || "all"}
          onValueChange={(val) => onFilterChange("paymentStatus", val)}
        >
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        {/* Note: DateRange picker could be added here later */}
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
          Showing <span className="font-medium text-foreground">{total}</span> orders
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClear}
            disabled={isPending}
            className="h-9 px-2 text-muted-foreground hover:text-foreground"
          >
            Clear filters
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
