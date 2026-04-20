"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@findeg/ui";
import { Label } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { cn } from "@lib/utils";

interface WeightInputProps {
  /** react-hook-form name for the weight in grams (integer) */
  name: string;
  label?: string;
  className?: string;
}

/**
 * WeightInput
 *
 * Input for weight with a g/kg toggle.
 * The form value is always stored in grams (integer).
 * The toggle just changes the display unit.
 */
export function WeightInput({ name, label = "Weight", className }: WeightInputProps) {
  const [unit, setUnit] = React.useState<"g" | "kg">("g");
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const error = name
    .split(".")
    .reduce(
      (o: Record<string, unknown>, k) => (o?.[k] as Record<string, unknown>) ?? {},
      errors as Record<string, unknown>,
    );
  const rawValue: number | null = watch(name) ?? null;

  // Display value in current unit
  const displayValue =
    rawValue == null
      ? ""
      : unit === "kg"
        ? (rawValue / 1000).toFixed(3).replace(/\.?0+$/, "")
        : String(rawValue);

  /**
   *
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) {
      setValue(name, null);
      return;
    }
    // Always store grams
    setValue(name, unit === "kg" ? Math.round(val * 1000) : Math.round(val));
  }

  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="flex gap-1">
        <Input
          type="number"
          min="0"
          step={unit === "kg" ? "0.001" : "1"}
          value={displayValue}
          onChange={handleChange}
          placeholder={unit === "kg" ? "e.g. 0.250" : "e.g. 250"}
          className={cn(
            "h-8 flex-1 text-sm",
            !!(error as { message?: string })?.message && "border-destructive",
          )}
        />
        <div className="flex rounded-md border">
          <Button
            type="button"
            variant={unit === "g" ? "default" : "ghost"}
            size="sm"
            className="h-8 rounded-r-none px-2.5 text-xs"
            onClick={() => setUnit("g")}
          >
            g
          </Button>
          <Button
            type="button"
            variant={unit === "kg" ? "default" : "ghost"}
            size="sm"
            className="h-8 rounded-l-none border-l px-2.5 text-xs"
            onClick={() => setUnit("kg")}
          >
            kg
          </Button>
        </div>
      </div>
      {!!(error as { message?: string })?.message && (
        <p className="text-xs text-destructive">{(error as { message?: string }).message}</p>
      )}
    </div>
  );
}
