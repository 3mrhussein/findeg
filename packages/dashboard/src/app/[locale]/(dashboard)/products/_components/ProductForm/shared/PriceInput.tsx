"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@ui";
import { Label } from "@ui";
import { cn } from "@lib/utils";

interface PriceInputProps {
  name: string;
  label: string;
  required?: boolean;
  className?: string;
  hint?: string;
}

/**
 * PriceInput
 *
 * A numeric input prefixed with the EGP currency symbol.
 * Validates 2 decimal places and non-negative values.
 */
export function PriceInput({ name, label, required, className, hint }: PriceInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = name
    .split(".")
    .reduce(
      (o: Record<string, unknown>, k) => (o?.[k] as Record<string, unknown>) ?? {},
      errors as Record<string, unknown>,
    );

  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={name} className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-2.5 select-none text-xs font-medium text-muted-foreground">
          EGP
        </span>
        <Input
          id={name}
          {...register(name, { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          className={cn(
            "h-8 pl-10 text-sm",
            !!(error as { message?: string })?.message && "border-destructive",
          )}
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {!!(error as { message?: string })?.message && (
        <p className="text-xs text-destructive">{(error as { message?: string }).message}</p>
      )}
    </div>
  );
}
