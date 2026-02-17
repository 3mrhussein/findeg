import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/Icon";

interface PageStateErrorProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Standardized full-page error state.
 */
export function PageStateError({
  title,
  description,
  actionLabel,
  actionHref,
}: PageStateErrorProps) {
  return (
    <Card className="max-w-2xl mx-auto border-destructive/30">
      <CardContent className="py-14 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <Icon name="x" className="w-5 h-5 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
        {actionLabel && actionHref ? (
          <Button asChild variant="outline">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
