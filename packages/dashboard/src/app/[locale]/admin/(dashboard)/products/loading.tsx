import { Skeleton } from "@findeg/ui";

/**
 * Loading state for Admin Products Catalog
 */
export default function ProductsLoading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex items-center gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="mt-8 border rounded-md">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-full" />
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-4 border-b last:border-b-0 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-md shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
