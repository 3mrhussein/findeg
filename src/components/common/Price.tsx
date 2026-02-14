import React from "react";

interface PriceProps {
  price: number;
  strikePrice?: number;
  currency?: string;
  className?: string;
}

/**
 *
 */
export const Price: React.FC<PriceProps> = ({
  price,
  strikePrice,
  currency = "$",
  className = "",
}) => {
  const hasDiscount = typeof strikePrice === "number" && strikePrice > price;

  if (hasDiscount) {
    return (
      <div className={`flex items-baseline gap-2 ${className}`}>
        <span className="text-2xl font-bold text-primary">
          {currency}
          {price.toFixed(2)}
        </span>
        <span className="text-lg font-medium text-muted-foreground line-through">
          {currency}
          {strikePrice.toFixed(2)}
        </span>
      </div>
    );
  }

  return (
    <p className={`text-2xl font-bold text-primary ${className}`}>
      {currency}
      {price.toFixed(2)}
    </p>
  );
};
