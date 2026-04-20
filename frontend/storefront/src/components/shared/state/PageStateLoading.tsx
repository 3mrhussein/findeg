import { Container } from "@findeg/ui";
import { Skeleton } from "@findeg/ui";

interface PageStateLoadingProps {
  withGrid?: boolean;
}

/**
 * Shared page-level loading skeleton for storefront routes.
 */
export function PageStateLoading({ withGrid = true }: PageStateLoadingProps) {
  return (
    <Container className="py-12 lg:py-16">
      <div className="space-y-8">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto" />
        </div>

        {withGrid ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
