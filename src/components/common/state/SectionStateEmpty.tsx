import { Card, CardContent } from "@/components/ui/card";

interface SectionStateEmptyProps {
  message: string;
}

/**
 * Standardized section-level empty state.
 */
export function SectionStateEmpty({ message }: SectionStateEmptyProps) {
  return (
    <Card className="text-center py-14 border-dashed">
      <CardContent>
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
