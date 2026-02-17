import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Standardized full-page loading placeholder.
 */
export function PageStateLoading() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="space-y-4 py-10">
        <Skeleton className="h-7 w-56 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
