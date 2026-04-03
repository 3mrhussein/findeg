import { PageShell } from "../../_components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * PLP loading fallback with 12 skeleton cards.
 */
export default function ShopCatchAllLoading() {
  return (
    <PageShell>
      <div className="mb-8 space-y-2">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-[30rem]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </PageShell>
  );
}
