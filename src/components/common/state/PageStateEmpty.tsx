import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon, IconName } from "@/components/common/Icon";

interface PageStateEmptyProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  iconName?: IconName;
}

/**
 * Standardized full-page empty state.
 */
export function PageStateEmpty({
  title,
  description,
  actionLabel,
  actionHref,
  iconName = "search",
}: PageStateEmptyProps) {
  return (
    <Card className="max-w-2xl mx-auto border-dashed">
      <CardContent className="py-14 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Icon name={iconName} className="w-5 h-5 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
        {actionLabel && actionHref ? (
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
