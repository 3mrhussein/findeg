"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@findeg/ui";
import { Label } from "@findeg/ui";
import { cn } from "@lib/utils";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  deleteProductAction,
  setProductStatusAction,
  checkSkuAvailableAction,
} from "@actions/admin-actions";

interface SkuInputProps {
  name: string;
  label?: string;
  required?: boolean;
  excludeVariantId?: number;
  placeholder?: string;
  hint?: string;
  className?: string;
}

type AvailabilityStatus = "idle" | "checking" | "available" | "taken";

/**
 * SkuInput
 *
 * Auto-uppercases on change, debounces uniqueness check via server action.
 * Shows ✓ (green) / ✗ (red) indicator after typing stops.
 */
export function SkuInput({
  name,
  label = "SKU",
  required,
  excludeVariantId,
  placeholder = "e.g. PEN-GRIP-BLU",
  hint,
  className,
}: SkuInputProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const value: string = watch(name) ?? "";
  const [status, setStatus] = React.useState<AvailabilityStatus>("idle");

  const error = name
    .split(".")
    .reduce(
      (o: Record<string, unknown>, k) => (o?.[k] as Record<string, unknown>) ?? {},
      errors as Record<string, unknown>,
    );

  // Debounced uniqueness check
  React.useEffect(() => {
    if (!value || value.length < 2) {
      setStatus("idle");
      return;
    }

    setStatus("checking");
    const timer = setTimeout(async () => {
      const result = await checkSkuAvailableAction(value, excludeVariantId);
      if (result.success) {
        setStatus(result.available ? "available" : "taken");
      } else {
        setStatus("idle");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [value, excludeVariantId]);

  /**
   *
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(name, e.target.value.toUpperCase().replace(/\s+/g, "-"), {
      shouldValidate: true,
    });
  }

  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={name} className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={name}
          {...register(name)}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "h-8 pr-8 font-mono text-sm uppercase tracking-wide",
            status === "taken" && "border-destructive",
            status === "available" && "border-emerald-500",
            !!(error as { message?: string })?.message && "border-destructive",
          )}
        />
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          {status === "checking" && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
          {status === "available" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
          {status === "taken" && <XCircle className="h-3.5 w-3.5 text-destructive" />}
        </div>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {status === "taken" && <p className="text-xs text-destructive">This SKU is already in use</p>}
      {!!(error as { message?: string })?.message && (
        <p className="text-xs text-destructive">{(error as { message?: string }).message}</p>
      )}
    </div>
  );
}
