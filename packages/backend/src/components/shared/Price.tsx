import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  strikePrice?: number;
  className?: string;
}

/**
 *
 */
export function Price({ price, strikePrice, className }: PriceProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-semibold">
        {new Intl.NumberFormat("en-EG", {
          style: "currency",
          currency: "EGP",
        }).format(price)}
      </span>
      {strikePrice ? (
        <span className="text-sm text-muted-foreground line-through">
          {new Intl.NumberFormat("en-EG", {
            style: "currency",
            currency: "EGP",
          }).format(strikePrice)}
        </span>
      ) : null}
    </div>
  );
}
