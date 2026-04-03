import { Skeleton } from "@/components/ui/skeleton";

export default function BrandsLoading() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
      </div>

      <div className="flex gap-6">
        {/* List Column */}
        <div className="flex-1 space-y-6">
          {/* Toolbar Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-full sm:w-40 rounded-xl" />
          </div>

          {/* Cards Skeletons */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 flex items-center gap-4"
              >
                <Skeleton className="h-14 w-20 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32 rounded-lg" />
                    <Skeleton className="h-5 w-24 rounded-lg" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-20 rounded-lg" />
                    <Skeleton className="h-3 w-24 rounded-lg" />
                  </div>
                </div>
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
