import * as React from "react";

/**
 *
 */
export function Icon({
  name,
  className,
  ...props
}: { name: string; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`material-symbols-outlined ${className || ""}`} {...props}>
      {name}
    </span>
  );
}
