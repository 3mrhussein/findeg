import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@ui";

interface SectionStateEmptyProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Shared section-level empty state with optional CTA.
 */
export function SectionStateEmpty({
  title,
  description,
  ctaLabel,
  ctaHref,
}: SectionStateEmptyProps) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/30 py-12 px-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {ctaLabel && ctaHref ? (
        <Button asChild className="mt-5">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
